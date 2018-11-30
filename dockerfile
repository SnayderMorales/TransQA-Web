
FROM ubuntu:16.04
Maintainer Snayder Morales
RUN  apt-get update -y
RUN apt-get install apache2  git -y
RUN service apache2 restart
CMD git clone https://github.com/SnayderMorales/TransQA-Web.git /var/www/html/
CMD chown -R www-data:www-data /var/www/html/TransQA-Web
CMD cp -R /var/www/html/TransQA-Web /var/www/html/
ENTRYPOINT apache2ctl -D FOREGROUND
RUN rm /var/www/html/index.html
