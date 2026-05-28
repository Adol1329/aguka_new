import 'dart:convert';
import 'package:aguka_mobile/shared/data/local/database_helper.dart';

abstract class IrrigationLocalDataSource {
  Future<void> queuePumpControl(String farmId, bool isActive);
}

class IrrigationLocalDataSourceImpl implements IrrigationLocalDataSource {
  final DatabaseHelper databaseHelper;

  IrrigationLocalDataSourceImpl({required this.databaseHelper});

  @override
  Future<void> queuePumpControl(String farmId, bool isActive) async {
    await databaseHelper.queueMutation(
      'POST',
      '/irrigation/control',
      jsonEncode({'farmId': farmId, 'action': isActive ? 'start' : 'stop'}),
    );
  }
}
