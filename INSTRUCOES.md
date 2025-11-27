# 📊 YouTube Analytics Dashboard - Instruções de Instalação

## 🚀 Como Rodar o Sistema

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passo 1: Instalar Dependências
```bash
npm install
```

### Passo 2: Rodar o Sistema
```bash
npm run dev
```

O sistema abrirá automaticamente no navegador em: `http://localhost:5173`

## 📁 Estrutura do Projeto

```
youtube-analytics-dashboard/
├── src/
│   ├── components/          # Componentes React
│   │   ├── AudienceAnalysis.tsx      # ✅ CORRIGIDO - Aba Público
│   │   ├── Overview.tsx
│   │   ├── VideoAnalysis.tsx
│   │   ├── GeographicAnalysis.tsx
│   │   ├── TrafficAnalysis.tsx
│   │   ├── DeviceTypeAnalysis.tsx
│   │   ├── TrendAnalysis.tsx
│   │   ├── PerformanceComparison.tsx
│   │   ├── AIInsights.tsx
│   │   └── ...
│   ├── data/                # Dados CSV
│   │   ├── audience-behavior/
│   │   ├── device-types/
│   │   └── ...
│   ├── services/            # Serviços
│   ├── lib/                 # Bibliotecas
│   ├── types.ts            # Definições de tipos
│   ├── App.tsx             # Aplicação principal
│   └── main.tsx            # Ponto de entrada
├── package.json
└── vite.config.ts
```

## 🎯 Principais Correções Feitas

### ✅ Aba Público - Comparativo Detalhado de Comportamento
- Cards mais compactos e organizados
- Exibição apenas de dados relevantes
- Layout responsivo otimizado
- Filtros para remover dados vazios
- Visual melhorado com gradientes e ícones

### 📊 Métricas Exibidas:
- **Principais**: Visualizações, Retenção, Tempo de Exibição, CTR
- **Secundárias**: Impressões e Comentários (quando disponíveis)

## 🛠️ Tecnologias Utilizadas
- React + TypeScript
- Vite
- Tailwind CSS
- Recharts (gráficos)
- Lucide React (ícones)

## 📝 Notas
- Os dados CSV devem estar na pasta `src/data/`
- O sistema processa automaticamente os arquivos CSV
- Modo escuro/claro disponível

## 🐛 Problemas Comuns

### Erro ao instalar dependências
```bash
npm cache clean --force
npm install
```

### Porta já em uso
```bash
# O Vite tentará usar outra porta automaticamente
# Ou você pode especificar uma porta:
npm run dev -- --port 3000
```

## 📧 Suporte
Em caso de dúvidas ou problemas, verifique:
1. Se todas as dependências foram instaladas
2. Se o Node.js está atualizado
3. Se não há erros no console do navegador
