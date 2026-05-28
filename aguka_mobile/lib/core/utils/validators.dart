class Validators {
  Validators._();

  static String? validatePhone(String? value) {
    if (value == null || value.isEmpty) return 'Phone number is required';
    // Rwanda phone: +250 7XX XXX XXX or 07XX XXX XXX
    final cleaned = value.replaceAll(RegExp(r'[\s\-]'), '');
    if (cleaned.startsWith('+250') && cleaned.length == 13) return null;
    if (cleaned.startsWith('0') && cleaned.length == 10) return null;
    return 'Enter a valid Rwandan phone number';
  }

  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) return null; // Email is optional
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) return 'Enter a valid email address';
    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return null;
  }

  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) return 'Please confirm your password';
    if (value != password) return 'Passwords do not match';
    return null;
  }

  static String? validateName(String? value) {
    if (value == null || value.isEmpty) return 'Full name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    return null;
  }

  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.isEmpty) return '$fieldName is required';
    return null;
  }

  /// Normalizes a Rwandan phone number to +250 format
  static String normalizePhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[\s\-]'), '');
    if (cleaned.startsWith('0') && cleaned.length == 10) {
      return '+250${cleaned.substring(1)}';
    }
    if (cleaned.startsWith('250') && cleaned.length == 12) {
      return '+$cleaned';
    }
    return cleaned;
  }
}
