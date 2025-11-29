const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/database');

const router = express.Router();

// Create transporter for email (using Gmail)
// MAKE EMAIL GLOBAL — SO ALL ROUTES CAN USE IT
global.emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Test once when server starts
global.emailTransporter.verify((error, success) => {
    if (error) {
        console.log("Email NOT ready:", error);
    } else {
        console.log("OFFICIAL BUP EMAIL READY — CAN SEND TO ALL USERS!");
    }
});


global.emailTransporter.verify(function(error, success) {
    if (error) {
        console.log('❌ Email configuration error:', error);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});


// Forgot password - send reset link
router.post('/forgot-password', async (req, res) => {
    const { email, userType } = req.body;

    console.log('📥 Received forgot password request:', { email, userType });

    // Validate required fields
    if (!email || !userType) {
        return res.status(400).json({
            success: false,
            message: 'Email and user type are required'
        });
    }

    try {
        let user;
        let tableName;
        
        // Check if user exists based on user type
        if (userType === 'student') {
            [user] = await db.execute('SELECT * FROM students WHERE email = ?', [email]);
            tableName = 'students';
        } else if (userType === 'alumni') {
            [user] = await db.execute('SELECT * FROM alumni WHERE email = ?', [email]);
            tableName = 'alumni';
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        // Always return success to prevent email enumeration
        if (user.length === 0) {
            console.log('📧 Reset link sent (user not found - security measure)');
            return res.json({
                success: true,
                message: 'If the email exists in our system, a reset link has been sent'
            });
        }

        const userData = user[0];

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Store reset token in database
        const resetTokenField = userType === 'student' ? 'student_id' : 'alumni_id';
        const userId = userData[resetTokenField];

        await db.execute(
            `INSERT INTO password_reset_tokens (user_id, user_type, token, expires_at) 
             VALUES (?, ?, ?, ?) 
             ON DUPLICATE KEY UPDATE token = ?, expires_at = ?`,
            [userId, userType, resetToken, resetTokenExpiry, resetToken, resetTokenExpiry]
        );

        // Generate reset link
        const resetLink = `http://localhost:3000/frontend/reset_password.html?token=${resetToken}&type=${userType}`;

        console.log('🔗 Reset link generated:', resetLink);

        try {
            // Send email with reset link
            const mailOptions = {
                from: process.env.EMAIL_USER || 'bup-alumni@example.com',
                to: email,
                subject: 'BUP Alumni System - Password Reset Request',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
                            <h1 style="margin: 0; font-size: 24px;">BUP Alumni Association</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                        </div>
                        
                        <div style="padding: 30px 20px;">
                            <h2 style="color: #333; margin-bottom: 20px;">Hello ${userData.name},</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                You recently requested to reset your password for your BUP Alumni System account. 
                                Click the button below to reset it.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetLink}" 
                                   style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                          color: white; text-decoration: none; border-radius: 8px; font-weight: bold; 
                                          font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                    Reset Your Password
                                </a>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                                This password reset link is valid for <strong>1 hour</strong>. 
                                If you didn't request a password reset, please ignore this email.
                            </p>
                            
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 25px;">
                                <p style="color: #666; margin: 0; font-size: 14px;">
                                    <strong>Note:</strong> For security reasons, this link will expire after 1 hour or after you reset your password.
                                </p>
                            </div>
                        </div>
                        
                        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 20px;">
                            <p style="color: #999; margin: 0; font-size: 14px;">
                                BUP Alumni Association<br>
                                Bangladesh University of Professionals<br>
                                This is an automated message, please do not reply to this email.
                            </p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Password reset email sent successfully to:', email);

            res.json({
                success: true,
                message: 'Password reset link has been sent to your email'
            });

        } catch (emailError) {
            console.error('❌ Failed to send email:', emailError);
            
            // Even if email fails, return success for security
            res.json({
                success: true,
                message: 'If the email exists in our system, a reset link has been sent',
                // In development, include the reset link for testing when email fails
                resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
                emailError: process.env.NODE_ENV === 'development' ? emailError.message : undefined
            });
        }

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
    const { token, userType, newPassword } = req.body;

    console.log('📥 Received reset password request');

    // Validate required fields
    if (!token || !userType || !newPassword) {
        return res.status(400).json({
            success: false,
            message: 'Token, user type, and new password are required'
        });
    }

    // Validate password length
    if (newPassword.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters long'
        });
    }

    try {
        // Find valid reset token
        const [tokens] = await db.execute(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND user_type = ? AND expires_at > NOW()',
            [token, userType]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        const resetToken = tokens[0];
        const userId = resetToken.user_id;

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        let userName;
        let userEmail;

        // Update user's password based on user type and get user info for email
        if (userType === 'student') {
            await db.execute(
                'UPDATE students SET password = ? WHERE student_id = ?',
                [hashedPassword, userId]
            );
            // Get user info for confirmation email
            const [user] = await db.execute(
                'SELECT name, email FROM students WHERE student_id = ?',
                [userId]
            );
            if (user.length > 0) {
                userName = user[0].name;
                userEmail = user[0].email;
            }
        } else if (userType === 'alumni') {
            await db.execute(
                'UPDATE alumni SET password = ? WHERE alumni_id = ?',
                [hashedPassword, userId]
            );
            // Get user info for confirmation email
            const [user] = await db.execute(
                'SELECT name, email FROM alumni WHERE alumni_id = ?',
                [userId]
            );
            if (user.length > 0) {
                userName = user[0].name;
                userEmail = user[0].email;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid user type'
            });
        }

        // Delete used reset token
        await db.execute(
            'DELETE FROM password_reset_tokens WHERE token = ?',
            [token]
        );

        console.log('✅ Password reset successful for user:', userId);

        // Send confirmation email
        try {
            if (userEmail) {
                const mailOptions = {
                    from: process.env.EMAIL_USER || 'bup-alumni@example.com',
                    to: userEmail,
                    subject: 'BUP Alumni System - Password Reset Successful',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <div style="text-align: center; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 20px; border-radius: 10px 10px 0 0; color: white;">
                                <h1 style="margin: 0; font-size: 24px;">BUP Alumni Association</h1>
                                <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Successful</p>
                            </div>
                            
                            <div style="padding: 30px 20px;">
                                <h2 style="color: #333; margin-bottom: 20px;">Hello ${userName},</h2>
                                
                                <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                    Your password has been successfully reset for your BUP Alumni System account.
                                </p>
                                
                                <div style="text-align: center; margin: 30px 0;">
                                    <div style="display: inline-block; padding: 14px 28px; background: #28a745; 
                                                color: white; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                        ✅ Password Updated Successfully
                                    </div>
                                </div>
                                
                                <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
                                    If you did not make this change, please contact our support team immediately.
                                </p>
                                
                                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 25px;">
                                    <p style="color: #666; margin: 0; font-size: 14px;">
                                        <strong>Security Tip:</strong> Use a strong, unique password and never share it with anyone.
                                    </p>
                                </div>
                            </div>
                            
                            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 20px;">
                                <p style="color: #999; margin: 0; font-size: 14px;">
                                    BUP Alumni Association<br>
                                    Bangladesh University of Professionals<br>
                                    This is an automated message, please do not reply to this email.
                                </p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                console.log('✅ Password reset confirmation email sent to:', userEmail);
            }
        } catch (emailError) {
            console.error('❌ Failed to send confirmation email:', emailError);
            // Don't fail the reset process if confirmation email fails
        }

        res.json({
            success: true,
            message: 'Password reset successfully'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Verify reset token (for frontend validation)
router.get('/verify-reset-token', async (req, res) => {
    const { token, userType } = req.query;

    if (!token || !userType) {
        return res.status(400).json({
            success: false,
            message: 'Token and user type are required'
        });
    }

    try {
        const [tokens] = await db.execute(
            'SELECT * FROM password_reset_tokens WHERE token = ? AND user_type = ? AND expires_at > NOW()',
            [token, userType]
        );

        if (tokens.length === 0) {
            return res.status(400).json({
                success: false,
                valid: false,
                message: 'Invalid or expired reset token'
            });
        }

        res.json({
            success: true,
            valid: true,
            message: 'Token is valid'
        });

    } catch (error) {
        console.error('❌ Verify token error:', error);
        res.status(500).json({
            success: false,
            valid: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;