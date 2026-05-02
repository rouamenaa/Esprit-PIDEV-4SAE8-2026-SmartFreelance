# Application Contract Service DevOps Stack

This service is configured for:

- Jenkins CI/CD
- JaCoCo coverage
- SonarQube quality analysis
- Docker image build
- Harbor image registry
- Kubernetes deployment
- Kubeadm cluster setup
- Prometheus + Grafana monitoring
- Jaeger tracing

## Pipeline flow (presentation)

```text
CI/CD Pipeline
   |
   |-- Build
   |-- Test
   |-- Jasmi Validation (custom processing / validation)
   `-- Deploy
```

- `Build`, `Test`, and `Jasmi Validation` are implemented in `Jenkinsfile.ci`.
- `Deploy` is implemented in `Jenkinsfile.cd`.

## 1) Kubeadm cluster (single control-plane example)

```bash
sudo kubeadm init --pod-network-cidr=10.244.0.0/16
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
kubectl apply -f https://raw.githubusercontent.com/flannel-io/flannel/master/Documentation/kube-flannel.yml
```

## 2) Install monitoring stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring --create-namespace
```

## 3) Install Jaeger

```bash
helm repo add jaegertracing https://jaegertracing.github.io/helm-charts
helm repo update
helm install jaeger jaegertracing/jaeger -n monitoring
```

## 4) Harbor image pull secret (namespace default)

```bash
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.local \
  --docker-username=<username> \
  --docker-password=<password> \
  --docker-email=<email> \
  -n default
```

## 5) Deploy service manifests

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/pdb.yaml
kubectl apply -f k8s/servicemonitor.yaml
```

## 6) Jenkins requirements

- CI job script path: `smartfreelance-backend/application-contract-service/Jenkinsfile.ci`
- CD job script path: `smartfreelance-backend/application-contract-service/Jenkinsfile.cd`
- Jenkins credentials:
  - `harbor-credentials` (username/password)
  - `kubeconfig-application-contract-service` (secret file)
- SonarQube server in Jenkins: `sonarqube-server`

