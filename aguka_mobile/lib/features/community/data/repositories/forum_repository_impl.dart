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
  Future<Either<Failure, List<ForumPost>>> getPosts({
    PostAudience? audienceType,
    String? audienceId,
    String? category,
  }) async {
    try {
      final posts = await remoteDataSource.getPosts(
        audienceType: audienceType,
        audienceId: audienceId,
        category: category,
      );
      return Right(posts);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumPost>> getPostWithComments(String postId) async {
    try {
      final post = await remoteDataSource.getPostWithComments(postId);
      return Right(post);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumPost>> createPost({
    required String title,
    required String content,
    String? category,
    PostType? type,
    PostAudience? audienceType,
    String? audienceId,
  }) async {
    try {
      final post = await remoteDataSource.createPost(
        title: title,
        content: content,
        category: category,
        type: type,
        audienceType: audienceType,
        audienceId: audienceId,
      );
      return Right(post);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, ForumComment>> addComment(
      String postId, String content) async {
    try {
      final comment = await remoteDataSource.addComment(postId, content);
      return Right(comment);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> likePost(String postId) async {
    try {
      await remoteDataSource.likePost(postId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
