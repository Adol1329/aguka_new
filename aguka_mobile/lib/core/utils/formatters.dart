import 'package:intl/intl.dart';

class Formatters {
  Formatters._();

  static String formatDate(DateTime date) =>
      DateFormat('dd MMM yyyy').format(date);

  static String formatDateTime(DateTime date) =>
      DateFormat('dd MMM yyyy, HH:mm').format(date);

  static String formatTime(DateTime date) =>
      DateFormat('HH:mm').format(date);

  static String formatRelativeTime(DateTime date) {
    final now = DateTime.now();
    final diff = now.difference(date);
    if (diff.inSeconds < 60) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return formatDate(date);
  }

  static String formatCurrency(double amount, {String currency = 'RWF'}) {
    final formatter = NumberFormat('#,##0', 'en_US');
    return '${formatter.format(amount)} $currency';
  }

  static String formatDecimal(double value, {int decimals = 1}) =>
      value.toStringAsFixed(decimals);

  static String formatPercent(double value) =>
      '${value.toStringAsFixed(1)}%';

  static String formatTemperature(double celsius) =>
      '${celsius.toStringAsFixed(1)}°C';

  static String formatPhone(String phone) {
    if (phone.startsWith('+250') && phone.length == 13) {
      return '+250 ${phone.substring(4, 7)} ${phone.substring(7, 10)} ${phone.substring(10)}';
    }
    return phone;
  }
}
