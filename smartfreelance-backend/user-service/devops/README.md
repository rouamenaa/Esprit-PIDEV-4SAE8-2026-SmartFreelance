# SmartFreelance DevOps

This setup gives you:
- Docker
- Kubernetes (k3s)
- Jenkins
- Prometheus
- Grafana

## 1) Start Jenkins

On your Docker host:

```bash
cd devops/jenkins
docker compose -f docker-compose.jenkins.yml up -d
```

Open:
- Jenkins: `http://localhost:8080`

## 2) Start Monitoring

On your Docker host:

```bash
cd devops/monitoring
docker compose -f docker-compose.monitoring.yml up -d
```

Open:
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000` (admin/admin)

## 3) Deploy user-service to Kubernetes

Build and push image first (from Jenkins pipeline or manually), then:

```bash
kubectl apply -f devops/k8s/namespace.yml
kubectl apply -f devops/k8s/user-service-deployment.yml
kubectl apply -f devops/k8s/user-service-service.yml
kubectl get pods -n smartfreelance
kubectl get svc -n smartfreelance
```

Service endpoint:
- `http://<your-node-ip>:30081`
- Metrics endpoint: `http://<your-node-ip>:30081/actuator/prometheus`

## Jenkins pipeline file

Use `devops/jenkins/Jenkinsfile.user-service` in a Jenkins pipeline job.

Before running pipeline:
- Create Jenkins credential with id `dockerhub-creds` (username/password)
- Update Docker image name in:
  - `devops/jenkins/Jenkinsfile.user-service`
  - `devops/k8s/user-service-deployment.yml`

## GitHub Actions secrets (for CD)

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `KUBE_CONFIG_B64` (base64 of kubeconfig content)
