class Validators {
  Validators._();

  static String? validatePhone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Phone number is required';
    }

    final cleaned = value.trim().replaceAll(RegExp(r'[\s\-()]'), '');
    final rwandaPhoneRegex = RegExp(r'^(\+250|250|0)7[2389]\d{7}$');
    if (rwandaPhoneRegex.hasMatch(cleaned)) return null;

    return 'Enter a valid Rwandan phone number';
  }

  static String? validateEmail(String? value) {
    if (value == null || value.trim().isEmpty) return null;

    final emailRegex = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Enter a valid email address';
    }

    return null;
  }

  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) return 'Password is required';
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!RegExp(r'[A-Za-z]').hasMatch(value)) {
      return 'Password must include a letter';
    }
    if (!RegExp(r'\d').hasMatch(value)) {
      return 'Password must include a number';
    }

    return null;
  }

  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) return 'Please confirm your password';
    if (value != password) return 'Passwords do not match';
    return null;
  }

  static String? validateName(String? value) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) return 'Full name is required';
    if (trimmed.length < 2) return 'Name must be at least 2 characters';
    if (!RegExp(r"^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$").hasMatch(trimmed)) {
      return 'Name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return null;
  }

  static String? validateRequired(String? value, String fieldName) {
    if (value == null || value.trim().isEmpty) return '$fieldName is required';
    return null;
  }

  static String? validatePositiveNumber(
    String? value,
    String fieldName, {
    bool required = true,
    double? max,
  }) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return required ? '$fieldName is required' : null;
    }

    final number = double.tryParse(trimmed);
    if (number == null) return '$fieldName must be a valid number';
    if (number <= 0) return '$fieldName must be greater than zero';
    if (max != null && number > max) return '$fieldName must be $max or less';

    return null;
  }

  static String? validatePositiveInteger(
    String? value,
    String fieldName, {
    bool required = true,
    int? max,
  }) {
    final trimmed = value?.trim() ?? '';
    if (trimmed.isEmpty) {
      return required ? '$fieldName is required' : null;
    }

    final number = int.tryParse(trimmed);
    if (number == null) return '$fieldName must be a whole number';
    if (number <= 0) return '$fieldName must be greater than zero';
    if (max != null && number > max) return '$fieldName must be $max or less';

    return null;
  }

  /// Normalizes a Rwandan phone number to +250 format
  static String normalizePhone(String phone) {
    final cleaned = phone.trim().replaceAll(RegExp(r'[\s\-()]'), '');
    if (cleaned.startsWith('0') && cleaned.length == 10) {
      return '+250${cleaned.substring(1)}';
    }
    if (cleaned.startsWith('250') && cleaned.length == 12) {
      return '+$cleaned';
    }
    return cleaned;
  }
}
