import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/community/data/models/forum_models.dart';

abstract class ForumRemoteDataSource {
  Future<List<ForumPost>> getPosts();
  Future<ForumPost> getPostWithComments(String postId);
  Future<ForumPost> createPost({
    required String title,
    required String content,
    String? category,
  });
  Future<ForumComment> addComment(String postId, String content);
}

class ForumRemoteDataSourceImpl implements ForumRemoteDataSource {
  final DioClient dioClient;

  ForumRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<ForumPost>> getPosts() async {
    try {
      final response = await dioClient.dio.get('/forum');
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
      final response = await dioClient.dio.get('/forum/$postId');
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
  }) async {
    try {
      final response = await dioClient.dio.post('/forum', data: {
        'title': title,
        'content': content,
        if (category != null && category.isNotEmpty) 'category': category,
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
      final response = await dioClient.dio.post('/forum/$postId/comments', data: {
        'content': content,
      });
      final data = response.data['data'] ?? response.data;
      return ForumComment.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to send comment'));
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
