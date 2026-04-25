FROM nginx:alpine

# Copiar configuración de Nginx para el Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos del proyecto
COPY . /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
