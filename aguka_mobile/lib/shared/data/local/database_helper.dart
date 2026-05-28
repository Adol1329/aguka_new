import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:path_provider/path_provider.dart';
import 'dart:io';

class DatabaseHelper {
  static final DatabaseHelper instance = DatabaseHelper._init();
  static Database? _database;

  DatabaseHelper._init();

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDB('aguka_farm.db');
    return _database!;
  }

  Future<Database> _initDB(String filePath) async {
    Directory documentsDirectory = await getApplicationDocumentsDirectory();
    String path = join(documentsDirectory.path, filePath);

    return await openDatabase(
      path,
      version: 2,
      onCreate: _createDB,
      onUpgrade: _upgradeDB,
    );
  }

  Future _upgradeDB(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      // Version 2 introduced sync_queue and notifications
      // These are already in _createDB, so if upgrading from v1, 
      // we would add them here.
    }
    // Future migrations would go here:
    // if (oldVersion < 3) {
    //   await db.execute('ALTER TABLE soil_readings ADD COLUMN battery_level REAL');
    // }
  }

  Future _createDB(Database db, int version) async {
    const idType = 'INTEGER PRIMARY KEY AUTOINCREMENT';
    const textType = 'TEXT NOT NULL';
    const textTypeNullable = 'TEXT';
    const intType = 'INTEGER NOT NULL';
    const doubleType = 'REAL NOT NULL';
    const boolType = 'BOOLEAN NOT NULL';

    // 1. Soil Readings Table
    await db.execute('''
      CREATE TABLE soil_readings (
        id $idType,
        remote_id $textTypeNullable UNIQUE,
        farm_id $textType,
        moisture_percent $doubleType,
        temp_celsius $doubleType,
        ph_level $doubleType,
        nitrogen $doubleType,
        phosphorus $doubleType,
        potassium $doubleType,
        reading_at $textType,
        is_synced $boolType DEFAULT 1
      )
    ''');

    // 2. Weather Readings Table
    await db.execute('''
      CREATE TABLE weather_readings (
        id $idType,
        remote_id $textTypeNullable UNIQUE,
        farm_id $textType,
        temp_celsius $doubleType,
        humidity $doubleType,
        rainfall $doubleType,
        wind_speed $doubleType,
        reading_at $textType,
        is_synced $boolType DEFAULT 1
      )
    ''');

    // 3. Market Prices Table
    await db.execute('''
      CREATE TABLE market_prices (
        id $idType,
        crop_id $textType,
        crop_name $textType,
        market_name $textType,
        price $doubleType,
        unit $textType,
        trend $textType,
        trend_percentage $doubleType,
        last_updated $textType,
        UNIQUE(crop_id, market_name)
      )
    ''');

    // 4. Irrigation Logs Table
    await db.execute('''
      CREATE TABLE irrigation_logs (
        id $idType,
        remote_id $textTypeNullable UNIQUE,
        farm_id $textType,
        zone_id $textType,
        status $textType,
        moisture_level $doubleType,
        started_at $textType,
        finished_at $textTypeNullable
      )
    ''');

    // 5. Notifications Table
    await db.execute('''
      CREATE TABLE notifications (
        id $idType,
        remote_id $textType UNIQUE,
        title $textType,
        message $textType,
        type $textType,
        priority $textType,
        created_at $textType,
        read_at $textTypeNullable
      )
    ''');

    // 6. Announcements Table
    await db.execute('''
      CREATE TABLE announcements (
        id $idType,
        remote_id $textType UNIQUE,
        title $textType,
        body $textType,
        author $textType,
        created_at $textType,
        is_urgent $boolType DEFAULT 0
      )
    ''');

    // 7. Sync Queue
    await db.execute('''
      CREATE TABLE sync_queue (
        id $idType,
        operation $textType,
        endpoint $textType,
        payload $textType,
        created_at $textType,
        retry_count $intType DEFAULT 0
      )
    ''');
  }

  // --- Generic Sync Queue Helpers ---
  
  Future<int> queueMutation(String operation, String endpoint, String payload) async {
    final db = await instance.database;
    return await db.insert('sync_queue', {
      'operation': operation,
      'endpoint': endpoint,
      'payload': payload,
      'created_at': DateTime.now().toIso8601String(),
      'retry_count': 0,
    });
  }

  Future<List<Map<String, dynamic>>> getPendingSyncs() async {
    final db = await instance.database;
    return await db.query('sync_queue', orderBy: 'created_at ASC');
  }

  Future<int> removeSyncItem(int id) async {
    final db = await instance.database;
    return await db.delete('sync_queue', where: 'id = ?', whereArgs: [id]);
  }

  Future<int> incrementRetryCount(int id) async {
    final db = await instance.database;
    return await db.rawUpdate('UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?', [id]);
  }

  // --- Soil Readings Helpers ---

  Future<void> insertSoilReadings(List<Map<String, dynamic>> readings) async {
    final db = await instance.database;
    Batch batch = db.batch();
    for (var reading in readings) {
      batch.insert('soil_readings', reading, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getLatestSoilReadings(String farmId) async {
    final db = await instance.database;
    return await db.query(
      'soil_readings',
      where: 'farm_id = ?',
      whereArgs: [farmId],
      orderBy: 'reading_at DESC',
      limit: 30,
    );
  }

  Future close() async {
    final db = await instance.database;
    db.close();
  }

  // --- Sync Timestamp Helpers ---
  
  Future<DateTime?> getLastSyncTimestamp() async {
    final db = await instance.database;
    final result = await db.query('sync_queue', orderBy: 'created_at DESC', limit: 1);
    if (result.isNotEmpty && result.first['created_at'] != null) {
      return DateTime.parse(result.first['created_at'] as String);
    }
    return null;
  }

  Future<void> updateLastSyncTimestamp(DateTime timestamp) async {
    // Simple implementation - store in a preferences table or reuse sync_queue
    // For now, we'll skip this as it's mainly for delta sync optimization
  }

  // --- Weather Data Helpers ---

  // --- Weather Data Helpers ---

  Future<void> insertWeatherData(List<Map<String, dynamic>> weatherList) async {
    final db = await instance.database;
    Batch batch = db.batch();
    for (var weather in weatherList) {
      batch.insert('weather_readings', {
        'farm_id': weather['farm_id'],
        'temp_celsius': weather['temp_celsius'] ?? 0.0,
        'humidity': weather['humidity'] ?? 0.0,
        'rainfall': weather['rainfall'] ?? 0.0,
        'wind_speed': weather['wind_speed'] ?? 0.0,
        'reading_at': weather['reading_at'] ?? DateTime.now().toIso8601String(),
        'is_synced': 1,
      }, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<Map<String, dynamic>?> getLatestWeatherReading(String farmId) async {
    final db = await instance.database;
    final results = await db.query(
      'weather_readings',
      where: 'farm_id = ?',
      whereArgs: [farmId],
      orderBy: 'reading_at DESC',
      limit: 1,
    );
    return results.isNotEmpty ? results.first : null;
  }

  // --- Market Prices Helpers ---

  // --- Market Prices Helpers ---

  Future<void> insertMarketPrices(List<Map<String, dynamic>> prices) async {
    final db = await instance.database;
    Batch batch = db.batch();
    for (var price in prices) {
      batch.insert('market_prices', price, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<List<Map<String, dynamic>>> getMarketPrices() async {
    final db = await instance.database;
    return await db.query('market_prices', orderBy: 'crop_name ASC');
  }

  // --- Irrigation Data Helpers ---

  Future<void> insertIrrigationData(List<Map<String, dynamic>> data) async {
    final db = await instance.database;
    Batch batch = db.batch();
    for (var record in data) {
      batch.insert('irrigation_logs', record, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  Future<Map<String, dynamic>?> getLatestIrrigationStatus(String farmId) async {
    final db = await instance.database;
    final results = await db.query(
      'irrigation_logs',
      where: 'farm_id = ?',
      whereArgs: [farmId],
      orderBy: 'started_at DESC',
      limit: 1,
    );
    return results.isNotEmpty ? results.first : null;
  }

  // --- Notifications Helpers ---

  Future<void> insertNotifications(List<Map<String, dynamic>> notifications) async {
    final db = await instance.database;
    Batch batch = db.batch();
    for (var notification in notifications) {
      batch.insert('notifications', notification, conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
  }

  // --- Sync Item Helpers ---

  Future<int> insertSyncItem(Map<String, dynamic> item) async {
    return await queueMutation(item['operation'], item['endpoint'], item['payload']);
  }

  Future<int> getPendingSyncsCount() async {
    final db = await instance.database;
    final result = await db.rawQuery('SELECT COUNT(*) as count FROM sync_queue');
    return result.first['count'] as int? ?? 0;
  }
}
