# Simple Chat Frontend

Este é o frontend de um serviço de webchat em tempo real. Para obter mais informações sobre o backend, acesse [aqui](https://github.com/schmoellerIuri/APISimpleChat). A versão em produção do site pode ser econtrada [aqui](https://simple-chat-v1.azurewebsites.net/).

## Descrição detalhada do sistema

O sistema consiste em um serviço de webchat com suporte para dispositivos desktop. Ele possui um sistema de autenticação no backend e é composto por três telas principais e um modal: login, cadastro, conversas e modal de adição de conversas. Cada usuário pode conversar com qualquer outro usuário, bastando buscar o username da pessoa desejada e iniciar a conversa instantaneamente.

Para a funcionalidade, foi utilizada a linguagem JavaScript, enquanto a estruturação da página e o estilo foram feitos com HTML e CSS, respectivamente. Não foi empregado nenhum framework tanto para a parte gráfica quanto para a funcionalidade do sistema. As requisições foram feitas por meio da biblioteca AXIOS.

O deploy do sistema foi feito via imagem da aplicação que está disponível no docker hub. Com a infraestrutura do Microsoft Azure a solução roda com um servidor nginx a partir do contêiner docker que é inicializado a partir da imagem no dockerhub.
A imagem oficial está disponível em: [](https://hub.docker.com/repository/docker/schmoelleriuri/simple-chat-front/general).

## Tela de login

Esta tela possui campos para inserir o nome de usuário e a senha para efetuar o login. Também oferece acesso à tela de cadastro de novos usuários. Após o login bem-sucedido, o usuário será redirecionado para a tela de conversas.

![Tela Login](https://github.com/schmoellerIuri/SimpleChatFront/blob/master/images/loginscreen.png)

## Tela de cadastro

Nesta tela, o usuário pode inserir um nome de usuário, uma senha e a confirmação da senha. Se a confirmação não coincidir com a senha, será exibido um aviso na tela. Da mesma forma, um aviso será mostrado em caso de tentativa de cadastro com um nome de usuário inválido. Se o cadastro for bem-sucedido, o usuário será redirecionado para a página de conversas.

![Tela de cadastro](https://github.com/schmoellerIuri/SimpleChatFront/blob/master/images/cadastro.png)

## Tela de conversas

Nesta tela, o usuário pode acessar todas as suas conversas e enviar mensagens em tempo real para qualquer outro usuário. Além disso, é possível fazer logout e abrir o modal para adicionar novas conversas.

![Tela de conversas](https://github.com/schmoellerIuri/SimpleChatFront/blob/master/images/conversations-2.png)

## Modal de adição de conversas

Este modal permite iniciar conversas com qualquer usuário, bastando selecionar o nome de usuário desejado.

![Modal](https://github.com/schmoellerIuri/SimpleChatFront/blob/master/images/modal.png)
