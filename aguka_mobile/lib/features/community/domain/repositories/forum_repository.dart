import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';

abstract class ForumRepository {
  Future<Either<Failure, List<ForumPost>>> getPosts();
  Future<Either<Failure, ForumPost>> getPostWithComments(String postId);
  Future<Either<Failure, ForumPost>> createPost({
    required String title,
    required String content,
    String? category,
  });
  Future<Either<Failure, ForumComment>> addComment(String postId, String content);
}
