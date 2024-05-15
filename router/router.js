const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const pool = require('../db/conn');
const path = require('path');

// Rota para servir o arquivo index.html
router.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Rota para servir o arquivo register.html
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'register.html'));
});

// Rota para servir o arquivo loginUser.html
router.get('/loginUser', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'loginUser.html'));
});

// Rota raiz, esta deve vir por último
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'tela.html'));
});

// Rota para servir o arquivo recover.html
router.get('/recover', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'recover.html'));
});

// Rota para registrar um novo usuário
router.post('/registerUser', (req, res) => {
    const { email, password } = req.body;

    const sql = "INSERT INTO users (email, senha) VALUES (?, ?)";
    pool.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Erro ao registrar usuário:', err);
            return;
        }
        console.log('Usuário registrado com sucesso');
    });

    res.redirect('/index');
});

// Rota para realizar o login do usuário
router.post('/loginUser', (req, res) => {
    const { email, password } = req.body;
    const query = `SELECT senha FROM users WHERE email= ?`;

    pool.query(query, [email], (err, results) => {
        if (err) {
            console.error("Erro ao acessar o banco de dados:", err);
            res.status(500).send('Erro interno do servidor');
            return;
        }

        if (results.length === 0) {
            res.send(`
                <script>
                    alert('Usuário não cadastrado');
                    window.location.href = '/index';
                </script>
            `);
            return;
        }

        const user = results[0];
        if (password === user.senha) {
            res.redirect('/');
        } else {
            res.redirect('/index?error=invalid_password');
        }
    });
});

// Rota para solicitar a recuperação de senha
router.post('/recover-password', (req, res) => {
    const { email } = req.body;
    const query = `SELECT * FROM users WHERE email= ?`;

    pool.query(query, [email], (err, results) => {
        if (err) {
            console.error("Erro ao acessar o banco de dados:", err);
            res.status(500).send('Erro interno do servidor');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Usuário não encontrado.');
            return;
        }

        const user = results[0];
        const token = crypto.randomBytes(20).toString('hex');
        const expires = Date.now() + 3600000; // 1 hora

        const updateQuery = `UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE email = ?`;
        pool.query(updateQuery, [token, expires, email], (updateErr) => {
            if (updateErr) {
                console.error('Erro ao atualizar token de recuperação:', updateErr);
                res.status(500).send('Erro ao processar recuperação de senha.');
                return;
            }

            const transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'seuemail@gmail.com',
                    pass: 'suasenha'
                }
            });

            const mailOptions = {
                to: user.email,
                from: 'senha-reset@seusite.com',
                subject: 'Redefinição de Senha',
                text: `Você está recebendo este email porque você (ou alguém) solicitou a redefinição da senha para sua conta.\n\n` +
                    `Por favor, clique no seguinte link ou cole em seu navegador para completar o processo:\n\n` +
                    `http://${req.headers.host}/reset-password/${token}\n\n` +
                    `Se você não solicitou isso, ignore este email e sua senha permanecerá inalterada.\n`
            };

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) {
                    console.error('Erro ao enviar o email:', mailErr);
                    res.status(500).send('Erro ao enviar o email.');
                    return;
                }
                res.status(200).send('Email de recuperação enviado.');
            });
        });
    });
});

// Rota para servir o arquivo reset.html
router.get('/reset-password/:token', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'reset.html'));
});

// Rota para redefinir a senha
router.post('/reset-password', (req, res) => {
    const { token, password } = req.body;
    const query = `SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?`;

    pool.query(query, [token, Date.now()], (err, results) => {
        if (err) {
            console.error("Erro ao acessar o banco de dados:", err);
            res.status(500).send('Erro interno do servidor');
            return;
        }

        if (results.length === 0) {
            res.status(400).send('Token de redefinição de senha é inválido ou expirou.');
            return;
        }

        const user = results[0];
        const updateQuery = `UPDATE users SET senha = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE email = ?`;
        pool.query(updateQuery, [password, user.email], (updateErr) => {
            if (updateErr) {
                console.error('Erro ao atualizar senha:', updateErr);
                res.status(500).send('Erro ao redefinir senha.');
                return;
            }
            res.status(200).send('Senha redefinida com sucesso.');
        });
    });
});

module.exports = router;
