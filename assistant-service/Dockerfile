FROM node:22-bookworm-slim
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV NODE_ENV=production
ENV HOST=0.0.0.0
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY assistant-service/package.json assistant-service/package.json
RUN pnpm install --frozen-lockfile --filter witech-assistant-service...
COPY assistant-service assistant-service
WORKDIR /app/assistant-service
EXPOSE 3001
CMD ["pnpm", "start"]
