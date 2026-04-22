# Utilizar una imagen ligera de Nginx
FROM nginx:alpine

# Eliminar los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar la estructura de tu proyecto al directorio que sirve Nginx
# NOTA: Se ha ajustado la ruta para coincidir con la arquitectura de Larman (src/)
COPY ./src/presentation/index.html /usr/share/nginx/html/index.html
COPY ./src/presentation/css /usr/share/nginx/html/css
COPY ./src/presentation/views /usr/share/nginx/html/views
COPY ./src/application/controllers /usr/share/nginx/html/controllers
COPY ./src/domain/models /usr/share/nginx/html/models

# Exponer el puerto 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
