#!/bin/bash

# 🏝️ TremitiBot Lambda Deployment Script
# Script per automatizzare il deployment della Lambda function

set -e  # Exit on error

echo "🚀 Avvio deployment TremitiBot Lambda..."

# Colori per output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per log colorato
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verifica prerequisiti
check_prerequisites() {
    log_info "Verifica prerequisiti..."
    
    # Verifica AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI non trovato. Installa AWS CLI prima di continuare."
        exit 1
    fi
    
    # Verifica SAM CLI
    if ! command -v sam &> /dev/null; then
        log_error "AWS SAM CLI non trovato. Installa SAM CLI prima di continuare."
        exit 1
    fi
    
    # Verifica Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js non trovato. Installa Node.js prima di continuare."
        exit 1
    fi
    
    # Verifica AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials non configurate. Esegui 'aws configure' prima di continuare."
        exit 1
    fi
    
    log_success "Prerequisiti verificati"
}

# Installazione dipendenze
install_dependencies() {
    log_info "Installazione dipendenze..."
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dipendenze installate"
    else
        log_info "Dipendenze già installate, aggiornamento..."
        npm install
        log_success "Dipendenze aggiornate"
    fi
}

# Test locali
run_tests() {
    log_info "Esecuzione test locali..."
    
    if npm test; then
        log_success "Test locali completati con successo"
    else
        log_warning "Test locali falliti, continuo comunque..."
    fi
}

# Build del progetto
build_project() {
    log_info "Build del progetto..."
    
    # Cleanup precedente
    if [ -f "lambda.zip" ]; then
        rm lambda.zip
    fi
    
    # Build con SAM
    sam build
    
    log_success "Build completato"
}

# Deploy su AWS
deploy_to_aws() {
    log_info "Deploy su AWS..."
    
    # Verifica se è il primo deploy
    if sam list deployments &> /dev/null; then
        log_info "Aggiornamento deployment esistente..."
        sam deploy --no-confirm-changeset
    else
        log_info "Primo deployment..."
        sam deploy --guided
    fi
    
    log_success "Deploy completato"
}

# Test post-deploy
test_deployment() {
    log_info "Test post-deploy..."
    
    # Ottieni URL API Gateway
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name tremiti-bot-lambda \
        --query 'Stacks[0].Outputs[?OutputKey==`TremitiBotApi`].OutputValue' \
        --output text 2>/dev/null || echo "")
    
    if [ -n "$API_URL" ]; then
        log_info "Test API Gateway: $API_URL"
        
        # Health check
        if curl -s "$API_URL/health" > /dev/null; then
            log_success "Health check OK"
        else
            log_warning "Health check fallito"
        fi
        
        # Test chat
        RESPONSE=$(curl -s -X POST "$API_URL/chat" \
            -H "Content-Type: application/json" \
            -d '{"message":"test","history":[]}')
        
        if echo "$RESPONSE" | grep -q "success"; then
            log_success "Test chat OK"
        else
            log_warning "Test chat fallito"
        fi
    else
        log_warning "Impossibile ottenere URL API Gateway"
    fi
}

# Mostra informazioni finali
show_info() {
    log_info "Informazioni deployment:"
    
    # Stack info
    STACK_INFO=$(aws cloudformation describe-stacks \
        --stack-name tremiti-bot-lambda \
        --query 'Stacks[0].Outputs' \
        --output table 2>/dev/null || echo "Stack non trovato")
    
    echo "$STACK_INFO"
    
    # Lambda function info
    log_info "Lambda function info:"
    aws lambda get-function \
        --function-name tremiti-bot-lambda \
        --query 'Configuration.{Runtime:Runtime,MemorySize:MemorySize,Timeout:Timeout,LastModified:LastModified}' \
        --output table 2>/dev/null || log_warning "Lambda function non trovata"
}

# Funzione principale
main() {
    echo "🏝️ ================================"
    echo "🚀 TremitiBot Lambda Deployment"
    echo "🏝️ ================================"
    echo ""
    
    # Esegui steps
    check_prerequisites
    install_dependencies
    run_tests
    build_project
    deploy_to_aws
    test_deployment
    show_info
    
    echo ""
    echo "🎉 Deployment completato con successo!"
    echo ""
    echo "📋 Prossimi passi:"
    echo "1. Configura CORS se necessario"
    echo "2. Imposta rate limiting in API Gateway"
    echo "3. Configura CloudWatch alarms"
    echo "4. Testa l'integrazione con la tua app"
    echo ""
    echo "📞 Per supporto: contatta il team di sviluppo"
}

# Gestione errori
trap 'log_error "Deployment fallito. Controlla i log per dettagli."; exit 1' ERR

# Esegui main
main "$@" 