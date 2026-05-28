import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/community/data/datasources/forum_remote_data_source.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';
import 'package:aguka_mobile/features/community/domain/repositories/forum_repository.dart';

class ForumRepositoryImpl implements ForumRepository {
  final ForumRemoteDataSource remoteDataSource;

  ForumRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<ForumPost>>> getPosts() async {
    try {
      return Right(await remoteDataSource.getPosts());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumPost>> getPostWithComments(String postId) async {
    try {
      return Right(await remoteDataSource.getPostWithComments(postId));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumPost>> createPost({
    required String title,
    required String content,
    String? category,
  }) async {
    try {
      return Right(await remoteDataSource.createPost(
        title: title,
        content: content,
        category: category,
      ));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumComment>> addComment(String postId, String content) async {
    try {
      return Right(await remoteDataSource.addComment(postId, content));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
