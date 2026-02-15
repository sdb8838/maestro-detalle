Usa SUBAGENTS para investigar en paralelo este proyecto. Lanza exactamente estos dos subagentes:

SUBAGENTE A — API Routes
Objetivo:
- Identificar todos los routers Express.
- Localizar middlewares clave.
- Detectar controladores asociados.
Formato de salida:
- 5–10 conclusiones claras
- Lista de archivos relevantes con paths
- Recomendación: top 5 archivos que debería leer el agente principal

SUBAGENTE B — Database Layer
Objetivo:
- Encontrar modelos, esquemas o entidades (ORM o SQL).
- Identificar dónde se inicializa la conexión.
- Localizar migraciones o configuraciones relevantes.
Formato de salida:
- 5–10 conclusiones claras
- Lista de archivos relevantes con paths
- Recomendación: top 5 archivos que debería leer el agente principal

Importante:
- Lanza los subagentes en paralelo mediante el sistema de SUBAGENTS de Cline.
- Recuerda que los subagentes son solo de lectura (no deben editar).
- Cuando terminen, sintetiza ambos resultados y dime qué hacer después.