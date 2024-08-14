const nodemailer = require('nodemailer');
const config = require("../config/config.js");

class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: "flores.laura1787@gmail.com",
                pass: config.mailPassword
            }
        });
    }

    async sendPurchaseEmail(email, first_name, ticket) {
        try {
            const mailOptions = {
                from: "Coder Test <flores.laura1787@gmail.com>",
                to: email,
                subject: 'Confirmación de compra',
                html: `
                    <h1>Confirmación de compra</h1>
                    <p>Gracias por tu compra, ${first_name}!</p>
                    <p>El número de tu orden es: ${ticket}</p>
    
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
        }
    }

    async sendPasswordResetEmail(email, first_name, token) {
        try {
            const mailOptions = {
                from: "Coder Test <flores.laura1787@gmail.com>",
                to: email,
                subject: 'Restablecimiento de contraseña',
                html: `
                    <h1>Restablecimiento de Contraseña</h1>
                    <p>Hola ${first_name},</p>
                    <p>Has solicitado restablecer tu contraseña. Utiliza el siguiente código para cambiar tu contraseña:</p>
                    <p><strong>${token}</strong></p>
                    <p>Este código expirará en 1 hora.</p>
                    <a href="http://localhost:8080/password">Restablecer Contraseña</a>
                    <p>Si no solicitaste este restablecimiento, ignora este correo.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
            
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
        }
    }

    async sendAccountDeletionEmail(email, first_name) {
        try {
            const mailOptions = {
                from: "Coder Test <flores.laura1787@gmail.com>",
                to: email,
                subject: 'Cuenta Eliminada por Inactividad',
                html: `
                    <h1>Cuenta Eliminada</h1>
                    <p>Hola ${first_name},</p>
                    <p>Tu cuenta ha sido eliminada debido a inactividad.</p>
                `
            };

            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
        }
    }

    async sendProductDeletedEmail(email, productTitle) {
        try {
            const mailOptions = {
                from: "Coder Test <flores.laura1787@gmail.com>",
                to: email,
                subject: 'Producto Eliminado',
                html: `
                    <h1>Producto Eliminado</h1>
                    <p>Hola!</p>
                    <p>El producto "${productTitle}" que poseías ha sido eliminado.</p>
                    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
                `
            };
    
            await this.transporter.sendMail(mailOptions);
    
        } catch (error) {
            console.error('Error al enviar el correo electrónico:', error);
        }
    }

}

module.exports = EmailManager;