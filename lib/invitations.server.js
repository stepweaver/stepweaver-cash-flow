import 'server-only';
import { adminDb } from './firebase-admin.js';
import { Resend } from 'resend';
import { randomBytes } from 'crypto';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Invitation status constants
export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Generate a secure invitation token
export function generateInvitationToken() {
  return randomBytes(32).toString('hex');
}

// Create a new invitation
export async function createInvitation(email, invitedBy, displayName = null, expiresAt = null) {
  try {
    // Set default expiration (7 days from now)
    const expirationDate = expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = {
      email: email.toLowerCase().trim(),
      invitedBy,
      displayName: displayName?.trim() || null,
      status: INVITATION_STATUS.PENDING,
      token: generateInvitationToken(),
      createdAt: new Date(),
      expiresAt: expirationDate,
      acceptedAt: null
    };

    // Check if invitation already exists for this email
    const existingInvitation = await adminDb
      .collection('invitations')
      .where('email', '==', invitation.email)
      .where('status', '==', INVITATION_STATUS.PENDING)
      .get();

    if (!existingInvitation.empty) {
      throw new Error('An invitation already exists for this email address');
    }

    // Save invitation to database
    const docRef = await adminDb.collection('invitations').add(invitation);

    return {
      id: docRef.id,
      ...invitation
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    throw error;
  }
}

// Send invitation email
export async function sendInvitationEmail(invitation, baseUrl) {
  try {
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'noreply@stepweaver.com',
      to: invitation.email,
      subject: 'You\'ve been invited to join λstepweaver Cash Flow',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to StepWeaver Cash Flow!</h2>
          
          <p>You've been invited to join our cash flow tracking application.</p>
          
          <p><strong>What you'll be able to do:</strong></p>
          <ul>
            <li>Track personal finances and bills</li>
            <li>Manage business transactions</li>
            <li>Upload and organize receipts</li>
            <li>Generate financial reports</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invitationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          
          <p><strong>Important:</strong> This invitation will expire on ${invitation.expiresAt.toLocaleDateString()}.</p>
          
          <p>If you have any questions, please contact your administrator.</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending invitation email:', error);
      throw new Error('Failed to send invitation email');
    }

    return data;
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
}

// Get invitation by token
export async function getInvitationByToken(token) {
  try {
    const snapshot = await adminDb
      .collection('invitations')
      .where('token', '==', token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    };
  } catch (error) {
    console.error('Error getting invitation by token:', error);
    throw error;
  }
}

// Accept invitation
export async function acceptInvitation(token, userId) {
  try {
    const invitation = await getInvitationByToken(token);

    if (!invitation) {
      throw new Error('Invalid invitation token');
    }

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      throw new Error('Invitation has already been used or expired');
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error('Invitation has expired');
    }

    // Update invitation status
    await adminDb.collection('invitations').doc(invitation.id).update({
      status: INVITATION_STATUS.ACCEPTED,
      acceptedAt: new Date(),
      acceptedBy: userId
    });

    return invitation;
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
}

// Get all invitations for admin view
export async function getInvitations() {
  try {
    const snapshot = await adminDb
      .collection('invitations')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting invitations:', error);
    throw error;
  }
}

// Cancel invitation
export async function cancelInvitation(invitationId) {
  try {
    await adminDb.collection('invitations').doc(invitationId).update({
      status: INVITATION_STATUS.CANCELLED,
      cancelledAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error cancelling invitation:', error);
    throw error;
  }
}

// Resend invitation email
export async function resendInvitationEmail(invitationId, baseUrl) {
  try {
    const doc = await adminDb.collection('invitations').doc(invitationId).get();

    if (!doc.exists) {
      throw new Error('Invitation not found');
    }

    const invitation = {
      id: doc.id,
      ...doc.data()
    };

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      throw new Error('Can only resend pending invitations');
    }

    // Generate new token and update expiration
    const newToken = generateInvitationToken();
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await adminDb.collection('invitations').doc(invitationId).update({
      token: newToken,
      expiresAt: newExpiresAt,
      resentAt: new Date()
    });

    // Send new invitation email
    const updatedInvitation = {
      ...invitation,
      token: newToken,
      expiresAt: newExpiresAt
    };

    await sendInvitationEmail(updatedInvitation, baseUrl);

    return { success: true };
  } catch (error) {
    console.error('Error resending invitation email:', error);
    throw error;
  }
}
