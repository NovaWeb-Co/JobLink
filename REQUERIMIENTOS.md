# Requerimientos del proyecto 

## Sesión 1 — 27/04/2026 
### Briefing inicial
Soy Carlos Castaño, gerente de una empresa del sector de base tecnológica,
y estoy liderando la creación de JobLink, 
una plataforma web pensada para conectar personas que necesitan servicios 
(hogar o negocio) con trabajadores independientes de su zona.

Actualmente vemos un problema claro en el mercado:
las personas pierden mucho tiempo buscando trabajadores confiables, 
y los trabajadores independientes tienen dificultades para conseguir clientes de forma constante.

JobLink busca solucionar esto con una plataforma sencilla, rápida y confiable donde:

- Los clientes puedan encontrar servicios fácilmente.
- Los trabajadores puedan ofrecer sus servicios y conseguir oportunidades.
- Se genere confianza mediante calificaciones y comentarios.

Para mí es clave que la experiencia sea muy intuitiva, 
incluso para personas que no son expertas en tecnología.

### Requerimientos acordados 
- REQ-01: (Alta prioridad) Publicación y búsqueda de servicios
  Necesito que:

  -  Un usuario pueda publicar un servicio que necesita (ej: plomería, electricidad, etc.).
  -  Otros usuarios puedan buscar servicios o trabajadores por categoría y ubicación.

- REQ-02: (Alta prioridad) Perfiles de usuarios (clientes y trabajadores)
  Quiero que existan perfiles claros donde:

  -  Se vea quién es el trabajador.
  -  Qué servicios ofrece.
  -  Información básica de contacto o descripción.

- REQ-03: (Media prioridad) Sistema básico de contacto
  Necesito que:

  -  Un cliente pueda contactar fácilmente a un trabajador desde la plataforma.
 
    ## Sesión 2 — 20/05/2026 
### Avances presentados al cliente
En esta sesión se presentó el **maquetado frontend** de la plataforma **JobLink** con las siguientes páginas:

- **Página de Inicio** con hero, categorías y navegación.
- **Página de Listado de Servicios**  con filtros y tarjetas.
- **Formulario de Registro**.
- **Formulario de Publicación de Servicios**

Se cumplieron los requerimientos mínimos obligatorios solicitados para esta entrega.

### Retroalimentación del cliente

El cliente indicó que el avance va bastante bien y que la aplicación ya transmite la idea de un producto funcional.

**Ajustes solicitados:**

1: (Alta prioridad) Mejorar la confianza visual de los perfiles y servicios:
   - Agregar imágenes por defecto en las tarjetas de servicios.
   - Mejorar los perfiles de trabajadores con: foto, descripción corta, experiencia y calificación visible.

2: (Alta prioridad) Mejorar el proceso de registro:
   - Diferenciar mejor entre clientes y trabajadores independientes.
   - Para trabajadores: agregar categoría principal de servicio, breve descripción y zona donde trabaja.

3: (Media prioridad) Mejorar la experiencia móvil y jerarquía visual:
   - Optimizar tamaños de botones, espaciados y formularios en dispositivos móviles.
   - Mejorar legibilidad del texto en el hero.
   - Destacar más los botones principales.

4: (Media prioridad) Hacer la publicación más guiada:
   - Agregar ayudas y ejemplos en los campos (descripción del problema, urgencia, horario deseado).

### Nuevos requerimientos prioritarios

- REQ-04: **Perfil completo del trabajador independiente** (foto, descripción, experiencia, calificación, servicios que ofrece y zona de trabajo).
- REQ-05: **Sistema básico de calificaciones y comentarios**.
- REQ-06: **Optimización responsive / experiencia móvil**.
- REQ-07: Mejorar confianza visual (imágenes por defecto y estados vacíos).
- REQ-08: Formularios más guiados con textos de ayuda.

## Sesión 3 — 26/05/2026

### Retroalimentación del cliente

El cliente aprobó la propuesta de implementar el sistema de autenticación, destacando que mejora significativamente la confianza en la plataforma y permite personalizar la experiencia según el tipo de usuario.

**Texto del cliente:**

> Me parece una muy buena decisión.  
> Desde el negocio, tener login y registro mejora muchísimo la confianza y también les permitirá personalizar la experiencia para clientes y trabajadores.  
> Eso sí, para esta etapa yo lo mantendría simple y enfocado en facilidad de uso.

### Nuevos Requerimientos - Sistema de Autenticación

- REQ-09: **Sistema de autenticación**:
   - Inicio de sesión.
   - Registro de usuarios.
   - Cierre de sesión.

- REQ-10: **Recuperación de contraseña**:
   - Opción “Olvidé mi contraseña”.

- REQ-11: **Persistencia de sesión**:
   - Mantener al usuario autenticado mientras navega por la plataforma.

- REQ-12: **Validaciones de formularios**:
   - Correos electrónicos válidos.
   - Contraseñas seguras.
   - Mensajes claros de error.
  
