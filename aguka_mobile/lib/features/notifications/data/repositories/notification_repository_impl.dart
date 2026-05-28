import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/network_info.dart';
import 'package:aguka_mobile/features/notifications/domain/entities/notification_entity.dart';
import 'package:aguka_mobile/features/notifications/domain/repositories/notification_repository.dart';
import 'package:aguka_mobile/features/notifications/data/datasources/notification_remote_data_source.dart';
import 'package:aguka_mobile/features/notifications/data/datasources/notification_local_data_source.dart';

class NotificationRepositoryImpl implements NotificationRepository {
  final NotificationRemoteDataSource remoteDataSource;
  final NotificationLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  NotificationRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, List<NotificationEntity>>> getNotifications() async {
    if (await networkInfo.isConnected) {
      try {
        final remoteNotifications = await remoteDataSource.getNotifications();
        await localDataSource.cacheNotifications(remoteNotifications);
        return Right(remoteNotifications);
      } on ServerException {
        // Fallback to local if server fails
        try {
          final localNotifications = await localDataSource.getCachedNotifications();
          return Right(localNotifications);
        } on CacheException {
          return Left(ServerFailure('Failed to fetch notifications'));
        }
      }
    } else {
      try {
        final localNotifications = await localDataSource.getCachedNotifications();
        return Right(localNotifications);
      } on CacheException {
        return Left(CacheFailure('Failed to fetch cached notifications'));
      }
    }
  }

  @override
  Future<Either<Failure, void>> markAsRead(String notificationId) async {
    // Optimistically update local
    try {
      await localDataSource.markAsRead(notificationId);
    } catch (e) {
      // Ignore local error
    }

    if (await networkInfo.isConnected) {
      try {
        await remoteDataSource.markAsRead(notificationId);
        return const Right(null);
      } on ServerException {
        return Left(ServerFailure('Failed to sync mark as read status'));
      }
    } else {
      // Offline: we could queue this mutation, but for now we just return success
      // since we already updated local DB.
      return const Right(null);
    }
  }

  @override
  Future<Either<Failure, void>> markAllAsRead() async {
    if (await networkInfo.isConnected) {
      try {
        await remoteDataSource.markAllAsRead();
        return const Right(null);
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    }
    return const Left(NetworkFailure());
  }
}
