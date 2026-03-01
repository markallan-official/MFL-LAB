# Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the SaaS Collaborative Platform across local development, staging, and production environments.

## Table of Contents

1. [Local Development](#local-development)
2. [Staging Deployment](#staging-deployment)
3. [Production Deployment](#production-deployment)
4. [Multi-Region Deployment](#multi-region-deployment)
5. [Monitoring & Rollback](#monitoring--rollback)

---

## Local Development

### Prerequisites

- Node.js 18+ LTS
- Docker & Docker Compose
- PostgreSQL 15 (via Docker)
- Redis (via Docker)

### Setup Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd saas-platform

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with local configuration

# 4. Start infrastructure
docker-compose up -d

# 5. Verify services
docker-compose ps

# 6. Run database migrations
npm run db:migrate --workspace=backend

# 7. Seed database (optional)
npm run db:seed --workspace=backend

# 8. Start development servers
npm run dev
```

### Accessing Local Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

## Staging Deployment

### Prerequisites

- AWS Account (or equivalent cloud provider)
- AWS CLI configured
- Docker registry access
- Terraform installed

### Deployment Process

### Step 1: Build Docker Images

```bash
# Set variables
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export IMAGE_TAG=staging-$(date +%Y%m%d-%H%M%S)

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build images
docker build -f backend/Dockerfile -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/saas-platform-backend:$IMAGE_TAG backend/
docker build -f frontend/Dockerfile -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/saas-platform-frontend:$IMAGE_TAG frontend/

# Push images
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/saas-platform-backend:$IMAGE_TAG
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/saas-platform-frontend:$IMAGE_TAG
```

### Step 2: Infrastructure Setup with Terraform

```bash
# Navigate to infrastructure
cd infrastructure/terraform

# Initialize Terraform
terraform init -backend-config="key=staging.tfstate" -backend-config="bucket=$TF_STATE_BUCKET"

# Plan deployment
terraform plan \
  -var="environment=staging" \
  -var="image_tag=$IMAGE_TAG" \
  -var="instance_count=2" \
  -out=tfplan

# Apply configuration
terraform apply tfplan
```

### Step 3: Database Migrations

```bash
# Get the database endpoint
export DB_HOST=$(terraform output -raw rds_endpoint)
export PGPASSWORD=$DB_PASSWORD

# Run migrations
psql -h $DB_HOST -U postgres -d saas_dev -f backend/migrations/001_initial_schema.sql

# Verify
psql -h $DB_HOST -U postgres -d saas_dev -c "\dt"
```

### Step 4: Deploy to Kubernetes

```bash
# Set context to staging cluster
kubectl config use-context staging-cluster

# Deploy backend
kubectl apply -f infrastructure/k8s/staging/backend-deployment.yaml
kubectl apply -f infrastructure/k8s/staging/backend-service.yaml

# Deploy frontend
kubectl apply -f infrastructure/k8s/staging/frontend-deployment.yaml
kubectl apply -f infrastructure/k8s/staging/frontend-service.yaml

# Check deployment status
kubectl get pods -n staging
kubectl get services -n staging
```

### Step 5: Verify Deployment

```bash
# Check application health
curl https://staging-api.example.com/health

# Check frontend
curl https://staging.example.com

# View logs
kubectl logs -f deployment/backend -n staging
```

---

## Production Deployment

### Prerequisites

- Completed staging deployment and testing
- Security audit passed
- Performance testing completed
- Disaster recovery plan in place

### Deployment Process

### Step 1: Pre-Deployment Checklist

```bash
# Run security scan
npm run security:scan

# Run tests
npm run test --workspaces

# Build validation
npm run build --workspaces

# Check environment
cat .env.production | grep -v "^#" | grep "."
```

### Step 2: Blue-Green Deployment Setup

```bash
# Create new deployment (Green)
kubectl apply -f infrastructure/k8s/production/backend-deployment-v2.yaml
kubectl apply -f infrastructure/k8s/production/frontend-deployment-v2.yaml

# Wait for health checks
kubectl rollout status deployment/backend-v2 -n production

# Run smoke tests
npm run test:smoke --production

# Switch traffic (Blue → Green)
kubectl patch service backend -p '{"spec":{"selector":{"version":"v2"}}}'
kubectl patch service frontend -p '{"spec":{"selector":{"version":"v2"}}}'

# Monitor metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --start-time 2026-02-25T14:00:00Z \
  --end-time 2026-02-25T14:05:00Z \
  --period 60 \
  --statistics Average,Maximum
```

### Step 3: Database Backup Before Migration

```bash
# Create backup snapshot
aws rds create-db-snapshot \
  --db-instance-identifier saas-platform-prod \
  --db-snapshot-identifier saas-platform-prod-pre-deploy-$(date +%Y%m%d-%H%M%S)

# Wait for snapshot
aws rds wait db-snapshot-available \
  --db-snapshot-identifier saas-platform-prod-pre-deploy-*
```

### Step 4: Production Deployment

```bash
# Set production context
kubectl config use-context production-cluster

# Deploy new version
kubectl set image deployment/backend backend=$IMAGE_REGISTRY/saas-platform-backend:$PROD_TAG -n production

# Monitor rollout
kubectl rollout status deployment/backend -n production --timeout=10m

# Scale if needed
kubectl scale deployment backend --replicas=5 -n production
```

### Step 5: Post-Deployment Validation

```bash
# Health checks
curl -I https://api.example.com/health
curl -I https://example.com

# Verify functionality
npm run test:e2e --production

# Check logs for errors
kubectl logs -l app=backend -n production --tail=100

# Monitor performance
kubectl top pods -n production
```

---

## Multi-Region Deployment

### Architecture

```
┌─────────────────────────────────────┐
│       Route 53 (DNS)                │
│  - Geolocation-based routing        │
│  - Health check failover            │
└──────────────┬──────────────────────┘
               │
    ┌──────────┼──────────┐
    ▼          ▼          ▼
 US-EAST   US-WEST   EU-WEST
 (Primary) (Backup)  (Backup)
```

### Step 1: Create Secondary Region Resources

```bash
# Create infrastructure in secondary region
export AWS_REGION=us-west-2

cd infrastructure/terraform
terraform apply \
  -var="environment=production" \
  -var="region=us-west-2" \
  -var="is_primary=false"

# Replicate database
aws rds create-db-instance-read-replica \
  --db-instance-identifier saas-platform-prod-us-west \
  --source-db-instance-identifier arn:aws:rds:us-east-1:ACCOUNT:db:saas-platform-prod
```

### Step 2: Setup Data Replication

```bash
# Enable cross-region backup copies
aws rds modify-db-instance \
  --db-instance-identifier saas-platform-prod \
  --copy-tags-to-snapshot \
  --backup-retention-period 30 \
  --apply-immediately

# Setup S3 replication for assets
aws s3api put-bucket-replication \
  --bucket saas-platform-assets \
  --replication-configuration file://replication-config.json
```

### Step 3: Configure Route 53

```bash
# Create health checks
aws route53 create-health-check \
  --health-check-config \
    IPAddress=PRIMARY_ELB_IP,\
    Port=80,\
    Type=HTTP,\
    ResourcePath=/health

# Create failover routing policy
aws route53 change-resource-record-sets \
  --hosted-zone-id $ZONE_ID \
  --change-batch file://failover-routing.json
```

---

## Monitoring & Rollback

### Monitoring Deployment

```bash
# Real-time metrics
watch -n 5 'kubectl top pods -n production'

# Error rate monitoring
kubectl logs -f deployment/backend -n production | grep ERROR

# CloudWatch dashboard
aws cloudwatch put-metric-alarm \
  --alarm-name ErrorRateHigh \
  --alarm-description "Alert on high error rate" \
  --metric-name ErrorCount \
  --namespace AWS/ApplicationELB \
  --statistic Sum \
  --period 60 \
  --threshold 100 \
  --comparison-operator GreaterThanThreshold
```

### Rollback Procedure

```bash
# Immediate rollback to previous version
kubectl rollout undo deployment/backend -n production

# Wait for rollback to complete
kubectl rollout status deployment/backend -n production --timeout=5m

# Verify rollback
kubectl describe pod <pod-name> -n production

# Restore from database backup if needed
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier saas-platform-prod-rollback \
  --db-snapshot-identifier saas-platform-prod-pre-deploy-*
```

### Post-Incident Checklist

- [ ] Identify root cause
- [ ] Create incident report
- [ ] Update runbooks
- [ ] Schedule post-mortem
- [ ] Implement preventive measures

---

## Automation with CI/CD

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm run build
      - run: |
          docker build -t ${{ secrets.AWS_ACCOUNT_ID }}.dkr.ecr.${{ secrets.AWS_REGION }}.amazonaws.com/saas-platform:${{ github.sha }} .
          aws ecr get-login-password | docker login --username AWS --password-stdin ...
          docker push ...

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: |
          kubernetes apply -f infrastructure/k8s/
          kubectl rollout status deployment/backend
```

---

## Troubleshooting Deployment Issues

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n production

# Check resource limits
kubectl top nodes

# View logs
kubectl logs <pod-name> -n production
```

### Database Connection Issues

```bash
# Test connectivity
pg_isready -h $DB_HOST -p 5432

# Check security groups
aws ec2 describe-security-groups --group-ids sg-xxxxxxxx
```

### Service Unreachable

```bash
# Check service endpoints
kubectl get endpoints -n production

# Check load balancer
aws elbv2 describe-target-health --target-group-arn <arn>
```

---

## Performance Optimization Post-Deployment

```bash
# Run performance tests
npm run test:performance

# Analyze slow queries
kubectl exec -it <postgres-pod> -- psql -d saas_dev -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Monitor cache hit rates
redis-cli INFO stats | grep keyspace_hits

# Optimize Kubernetes resources
kubectl set resources deployment backend --requests=cpu=500m,memory=512Mi --limits=cpu=1,memory=1Gi
```

---

**Version**: 1.0  
**Last Updated**: February 25, 2026  
**Maintained By**: DevOps Team
