#!/usr/bin/env bash
# Used by Jenkinsfile.cd (Deploy stage). Expects env: KUBECONFIG_FILE, K8S_NAMESPACE,
# K8S_DEPLOYMENT, FULL_IMAGE (set by Jenkins job environment + withCredentials).

set -euo pipefail

export KUBECONFIG="${KUBECONFIG_FILE:?KUBECONFIG_FILE is not set}"

k() {
  # --validate=false: flaky OpenAPI downloads from overloaded apiserver
  # --request-timeout: slow clusters
  kubectl --request-timeout=120s "$@"
}

apply_retry() {
  local file="$1"
  local i
  for i in 1 2 3 4 5; do
    if k apply --validate=false -f "$file" -n "${K8S_NAMESPACE:?}"; then
      return 0
    fi
    sleep $((i * 3))
  done
  return 1
}

k version --client
k cluster-info || true

apply_retry k8s/configmap.yaml
apply_retry k8s/secret.yaml
apply_retry k8s/deployment.yaml
apply_retry k8s/service.yaml
apply_retry k8s/ingress.yaml
apply_retry k8s/hpa.yaml
apply_retry k8s/pdb.yaml
apply_retry k8s/servicemonitor.yaml

k set image deployment/"${K8S_DEPLOYMENT:?}" \
  application-contract-service="${FULL_IMAGE:?}" \
  -n "${K8S_NAMESPACE}"
k rollout status deployment/"${K8S_DEPLOYMENT}" -n "${K8S_NAMESPACE}" --timeout=240s
