import { supabaseAdmin, handleSupabaseError } from './supabase';
import bcrypt from 'bcryptjs';

/**
 * Supabase Database Adapter for ZenConsole
 * Provides user authentication and management functions
 */

// ─────────────────────────────────────────────
//  USER AUTHENTICATION
// ─────────────────────────────────────────────

/**
 * Get user by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'Get user by email');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error getting user by email:', error);
    return null;
  }
}

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByUsername(username) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .ilike('username', username)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'Get user by username');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error getting user by username:', error);
    return null;
  }
}

/**
 * Get user by email or username
 * @param {string} identifier - Email or username
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserByEmailOrUsername(identifier) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`email.ilike.${identifier},username.ilike.${identifier}`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      handleSupabaseError(error, 'Get user by email or username');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error getting user by email or username:', error);
    return null;
  }
}

/**
 * Verify user password and return user if valid
 * @param {string} identifier - Email or username
 * @param {string} password - Plain text password
 * @returns {Promise<Object|null>} User object (without password_hash) or null
 */
export async function verifyUserPassword(identifier, password) {
  try {
    // Get user by email or username
    const user = await getUserByEmailOrUsername(identifier);
    
    if (!user) {
      console.log('[SupabaseDB] User not found:', identifier);
      return null;
    }

    // Check if user is active
    if (!user.is_active) {
      console.log('[SupabaseDB] User is inactive:', identifier);
      return null;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      console.log('[SupabaseDB] Invalid password for user:', identifier);
      return null;
    }

    // Remove password_hash from returned object
    const { password_hash, ...safeUser } = user;
    
    return safeUser;
  } catch (error) {
    console.error('[SupabaseDB] Error verifying user password:', error);
    return null;
  }
}

/**
 * Update user's last login timestamp
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function updateLastLogin(userId) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      handleSupabaseError(error, 'Update last login');
    }

    return true;
  } catch (error) {
    console.error('[SupabaseDB] Error updating last login:', error);
    return false;
  }
}

// ─────────────────────────────────────────────
//  USER MANAGEMENT
// ─────────────────────────────────────────────

/**
 * Get all users (without password hashes)
 * @returns {Promise<Array>} Array of user objects
 */
export async function getUsers() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role, is_active, created_at, updated_at, last_login_at')
      .order('created_at', { ascending: false });

    if (error) {
      handleSupabaseError(error, 'Get users');
    }

    return data || [];
  } catch (error) {
    console.error('[SupabaseDB] Error getting users:', error);
    return [];
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object or null
 */
export async function getUserById(userId) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, role, is_active, created_at, updated_at, last_login_at')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, 'Get user by ID');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error getting user by ID:', error);
    return null;
  }
}

/**
 * Create a new user
 * @param {Object} userData - User data
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Plain text password
 * @param {string} [userData.role='user'] - User role (user/admin)
 * @returns {Promise<Object>} Created user object
 */
export async function createUser({ username, email, password, role = 'user' }) {
  try {
    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      throw new Error('Username already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        role,
        is_active: true,
      })
      .select('id, username, email, role, is_active, created_at, updated_at, last_login_at')
      .single();

    if (error) {
      handleSupabaseError(error, 'Create user');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error creating user:', error);
    throw error;
  }
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object|null>} Updated user object or null
 */
export async function updateUser(userId, updates) {
  try {
    // If updating password, hash it
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password_hash = await bcrypt.hash(updates.password, salt);
      delete updates.password;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, username, email, role, is_active, created_at, updated_at, last_login_at')
      .single();

    if (error) {
      handleSupabaseError(error, 'Update user');
    }

    return data;
  } catch (error) {
    console.error('[SupabaseDB] Error updating user:', error);
    return null;
  }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUser(userId) {
  try {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      handleSupabaseError(error, 'Delete user');
    }

    return true;
  } catch (error) {
    console.error('[SupabaseDB] Error deleting user:', error);
    return false;
  }
}

// ─────────────────────────────────────────────
//  SETTINGS
// ─────────────────────────────────────────────

/**
 * Get application settings
 * @returns {Promise<Object>} Settings object
 */
export async function getSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from('settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return {
          require_login: true,
          registration_enabled: false,
          cloud_enabled: false,
        };
      }
      handleSupabaseError(error, 'Get settings');
    }

    return data || {};
  } catch (error) {
    console.error('[SupabaseDB] Error getting settings:', error);
    return {};
  }
}

/**
 * Update application settings
 * @param {Object} updates - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export async function updateSettings(updates) {
  try {
    // Check if settings exist
    const existing = await getSettings();
    
    if (existing.id) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from('settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'Update settings');
      }

      return data;
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from('settings')
        .insert(updates)
        .select()
        .single();

      if (error) {
        handleSupabaseError(error, 'Insert settings');
      }

      return data;
    }
  } catch (error) {
    console.error('[SupabaseDB] Error updating settings:', error);
    throw error;
  }
}
