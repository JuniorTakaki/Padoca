-- Criação do banco de dados
CREATE DATABASE sistema_login_registro;

-- Uso do banco de dados
USE sistema_login_registro;

-- Criação da tabela de usuários
-- Criação da tabela de usuários com chaves estrangeiras
Create table users (
users_id int primary key auto_increment not null,
email VARCHAR(90) not null unique,
senha VARCHAR(90) not null unique,
planos_id int,
FOREIGN KEY (planos_id) REFERENCES planos(id),
cartoes_id int,
FOREIGN KEY (cartoes_id) references cartoes(id)
);

CREATE TABLE planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    preco DECIMAL(10, 2)
);

-- Inserir dados na tabela "planos"
INSERT INTO planos (nome, preco) VALUES
('Plano Básico', 15.00),
('Plano Intermediário', 20.00),
('Plano Premium', 28.00),
('Plano Avulso', NULL);

-- Criar a tabela "cartoes"
CREATE TABLE cartoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(16) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    validade DATE NOT NULL,
    cvv VARCHAR(4) NOT NULL
);

-- Inserção do usuário administrador
INSERT INTO users(email, senha) VALUES ('admin@example.com', 'adminadmin');

ALTER TABLE users
ADD COLUMN resetPasswordToken VARCHAR(255),
ADD COLUMN resetPasswordExpires TIMESTAMP;




SELECT * FROM planos;

-- Visualizar os registros da tabela "cartoes"
SELECT * FROM cartoes;
select * from users;
SELECT senha FROM users WHERE email= 'juniortakaki10@gmail.com';

SELECT 
    users.users_id,
    users.senha,
    users.email,
    planos.id,
    planos.nome,
    planos.preco
FROM 
    users
JOIN 
    planos ON users.planos_id = planos.id;

