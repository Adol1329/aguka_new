import 'package:equatable/equatable.dart';

class ForumComment extends Equatable {
  final String id;
  final String content;
  final String authorName;
  final DateTime createdAt;

  const ForumComment({
    required this.id,
    required this.content,
    required this.authorName,
    required this.createdAt,
  });

  factory ForumComment.fromJson(Map<String, dynamic> json) {
    return ForumComment(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      authorName: json['authorName']?.toString() ?? '',
      createdAt: json['createdAt'] == null
          ? DateTime.fromMillisecondsSinceEpoch(0)
          : DateTime.parse(json['createdAt'].toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'content': content,
        'authorName': authorName,
        'createdAt': createdAt.toIso8601String(),
      };

  @override
  List<Object?> get props => [id, content, authorName, createdAt];
}

class ForumPost extends Equatable {
  final String id;
  final String title;
  final String content;
  final String? category;
  final String authorName;
  final String? authorFarm;
  final int commentCount;
  final int likeCount;
  final DateTime createdAt;
  final List<ForumComment> comments;

  const ForumPost({
    required this.id,
    required this.title,
    required this.content,
    this.category,
    required this.authorName,
    this.authorFarm,
    required this.commentCount,
    required this.likeCount,
    required this.createdAt,
    this.comments = const [],
  });

  factory ForumPost.fromJson(Map<String, dynamic> json) {
    final comments = json['comments'];
    return ForumPost(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      category: json['category']?.toString(),
      authorName: json['authorName']?.toString() ?? '',
      authorFarm: json['authorFarm']?.toString(),
      commentCount: int.tryParse(json['commentCount']?.toString() ?? '') ?? 0,
      likeCount: int.tryParse(json['likeCount']?.toString() ?? '') ?? 0,
      createdAt: json['createdAt'] == null
          ? DateTime.fromMillisecondsSinceEpoch(0)
          : DateTime.parse(json['createdAt'].toString()),
      comments: comments is List
          ? comments
              .map((item) => ForumComment.fromJson(item as Map<String, dynamic>))
              .toList()
          : const [],
    );
  }

  ForumPost copyWith({List<ForumComment>? comments, int? commentCount}) {
    return ForumPost(
      id: id,
      title: title,
      content: content,
      category: category,
      authorName: authorName,
      authorFarm: authorFarm,
      commentCount: commentCount ?? this.commentCount,
      likeCount: likeCount,
      createdAt: createdAt,
      comments: comments ?? this.comments,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'category': category,
        'authorName': authorName,
        'authorFarm': authorFarm,
        'commentCount': commentCount,
        'likeCount': likeCount,
        'createdAt': createdAt.toIso8601String(),
        'comments': comments.map((comment) => comment.toJson()).toList(),
      };

  @override
  List<Object?> get props => [
        id,
        title,
        content,
        category,
        authorName,
        authorFarm,
        commentCount,
        likeCount,
        createdAt,
        comments,
      ];
}
