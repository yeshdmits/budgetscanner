{{/*
Expand the name of the chart.
*/}}
{{- define "budgetscanner.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "budgetscanner.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "budgetscanner.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "budgetscanner.labels" -}}
helm.sh/chart: {{ include "budgetscanner.chart" . }}
{{ include "budgetscanner.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "budgetscanner.selectorLabels" -}}
app.kubernetes.io/name: {{ include "budgetscanner.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
MongoDB fullname
*/}}
{{- define "budgetscanner.mongodb.fullname" -}}
{{- printf "%s-mongodb" (include "budgetscanner.fullname" .) | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
MongoDB labels
*/}}
{{- define "budgetscanner.mongodb.labels" -}}
helm.sh/chart: {{ include "budgetscanner.chart" . }}
{{ include "budgetscanner.mongodb.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
MongoDB selector labels
*/}}
{{- define "budgetscanner.mongodb.selectorLabels" -}}
app.kubernetes.io/name: {{ include "budgetscanner.name" . }}-mongodb
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: database
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "budgetscanner.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "budgetscanner.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
MongoDB connection string
*/}}
{{- define "budgetscanner.mongodb.uri" -}}
{{- if .Values.mongodb.auth.enabled }}
{{- printf "mongodb://%s:%s@%s:%d/%s" .Values.mongodb.auth.rootUsername .Values.mongodb.auth.rootPassword (include "budgetscanner.mongodb.fullname" .) (int .Values.mongodb.service.port) .Values.mongodb.auth.database }}
{{- else }}
{{- printf "mongodb://%s:%d/%s" (include "budgetscanner.mongodb.fullname" .) (int .Values.mongodb.service.port) .Values.mongodb.auth.database }}
{{- end }}
{{- end }}

{{/*
Client URL for CORS
*/}}
{{- define "budgetscanner.clientUrl" -}}
{{- if .Values.ingress.enabled }}
{{- $host := (index .Values.ingress.hosts 0).host }}
{{- if .Values.ingress.tls }}
{{- printf "https://%s" $host }}
{{- else }}
{{- printf "http://%s" $host }}
{{- end }}
{{- else }}
{{- printf "http://%s:%d" (include "budgetscanner.fullname" .) (int .Values.app.service.port) }}
{{- end }}
{{- end }}
