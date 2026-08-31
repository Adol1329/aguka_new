import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';

abstract class ForumRemoteDataSource {
  Future<List<ForumPost>> getPosts({
    PostAudience? audienceType,
    String? audienceId,
    String? category,
  });
  Future<ForumPost> getPostWithComments(String postId);
  Future<ForumPost> createPost({
    required String title,
    required String content,
    String? category,
    PostType? type,
    PostAudience? audienceType,
    String? audienceId,
  });
  Future<ForumComment> addComment(String postId, String content);
  Future<void> likePost(String postId);
}

class ForumRemoteDataSourceImpl implements ForumRemoteDataSource {
  final DioClient dioClient;

  ForumRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<ForumPost>> getPosts({
    PostAudience? audienceType,
    String? audienceId,
    String? category,
  }) async {
    try {
      final response = await dioClient.dio.get('/forums', queryParameters: {
        if (audienceType != null) 'audienceType': audienceType.toString().split('.').last,
        if (audienceId != null) 'audienceId': audienceId,
        if (category != null) 'category': category,
      });
      final data = response.data['data'] ?? response.data;
      final posts = data is Map<String, dynamic> ? data['posts'] : data;
      if (posts is! List) throw ServerException('Invalid forum response');
      return posts
          .map((item) => ForumPost.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load discussions'));
    }
  }

  @override
  Future<ForumPost> getPostWithComments(String postId) async {
    try {
      final response = await dioClient.dio.get('/forums/$postId');
      final data = response.data['data'] ?? response.data;
      return ForumPost.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load discussion'));
    }
  }

  @override
  Future<ForumPost> createPost({
    required String title,
    required String content,
    String? category,
    PostType? type,
    PostAudience? audienceType,
    String? audienceId,
  }) async {
    try {
      final response = await dioClient.dio.post('/forums', data: {
        'title': title,
        'content': content,
        if (category != null && category.isNotEmpty) 'category': category,
        if (type != null) 'type': type.toString().split('.').last,
        if (audienceType != null) 'audienceType': audienceType.toString().split('.').last,
        if (audienceId != null) 'audienceId': audienceId,
      });
      final data = response.data['data'] ?? response.data;
      return ForumPost.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to create discussion'));
    }
  }

  @override
  Future<ForumComment> addComment(String postId, String content) async {
    try {
      final response = await dioClient.dio.post('/forums/$postId/comments', data: {
        'content': content,
      });
      final data = response.data['data'] ?? response.data;
      return ForumComment.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to send comment'));
    }
  }

  @override
  Future<void> likePost(String postId) async {
    try {
      await dioClient.dio.post('/forums/$postId/like');
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to like post'));
    }
  }

  String _errorMessage(DioException error, String fallback) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final errorValue = data['error'];
      if (errorValue is Map<String, dynamic>) {
        return errorValue['message']?.toString() ?? fallback;
      }
      if (errorValue is String) return errorValue;
      return data['message']?.toString() ?? fallback;
    }
    return error.message ?? fallback;
  }
}
