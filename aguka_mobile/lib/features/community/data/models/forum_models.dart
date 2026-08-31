import 'package:equatable/equatable.dart';

enum PostAudience {
  GLOBAL,
  DISTRICT,
  COOPERATIVE,
  ASSIGNED_FARMERS,
}

enum PostType {
  COMMUNITY_POST,
  COMMUNITY_ADVISORY,
  COMMUNITY_ALERT,
  COMMUNITY_EMERGENCY,
}

class ForumComment extends Equatable {
  final String id;
  final String content;
  final String authorId;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final bool isAcceptedAnswer;
  final DateTime createdAt;
  final List<ForumComment> replies;

  const ForumComment({
    required this.id,
    required this.content,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    this.isAcceptedAnswer = false,
    required this.createdAt,
    this.replies = const [],
  });

  factory ForumComment.fromJson(Map<String, dynamic> json) {
    final repliesJson = json['replies'];
    return ForumComment(
      id: json['id']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      authorId: json['authorId']?.toString() ?? '',
      authorName: json['authorName']?.toString() ?? '',
      authorRole: json['authorRole']?.toString() ?? 'farmer',
      authorAvatar: json['authorAvatar']?.toString(),
      isAcceptedAnswer: json['isAcceptedAnswer'] == true,
      createdAt: json['createdAt'] == null
          ? DateTime.fromMillisecondsSinceEpoch(0)
          : DateTime.parse(json['createdAt'].toString()),
      replies: repliesJson is List
          ? repliesJson
              .map((item) => ForumComment.fromJson(item as Map<String, dynamic>))
              .toList()
          : const [],
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'content': content,
        'authorId': authorId,
        'authorName': authorName,
        'authorRole': authorRole,
        'authorAvatar': authorAvatar,
        'isAcceptedAnswer': isAcceptedAnswer,
        'createdAt': createdAt.toIso8601String(),
        'replies': replies.map((r) => r.toJson()).toList(),
      };

  @override
  List<Object?> get props => [
        id,
        content,
        authorId,
        authorName,
        authorRole,
        authorAvatar,
        isAcceptedAnswer,
        createdAt,
        replies,
      ];
}

class ForumPost extends Equatable {
  final String id;
  final String title;
  final String content;
  final String? category;
  final PostType type;
  final String priority;
  final PostAudience audienceType;
  final String? audienceId;
  final String authorId;
  final String authorName;
  final String authorRole;
  final String? authorAvatar;
  final String? authorFarm;
  final String? authorDistrict;
  final List<String> imageUrls;
  final List<String> videoUrls;
  final List<String> attachmentUrls;
  final int commentCount;
  final int likeCount;
  final int viewCount;
  final bool hasLiked;
  final bool isPinned;
  final bool isAnswered;
  final bool isKnowledgeBase;
  final DateTime createdAt;
  final List<ForumComment> comments;

  const ForumPost({
    required this.id,
    required this.title,
    required this.content,
    this.category,
    required this.type,
    required this.priority,
    required this.audienceType,
    this.audienceId,
    required this.authorId,
    required this.authorName,
    required this.authorRole,
    this.authorAvatar,
    this.authorFarm,
    this.authorDistrict,
    this.imageUrls = const [],
    this.videoUrls = const [],
    this.attachmentUrls = const [],
    required this.commentCount,
    required this.likeCount,
    required this.viewCount,
    this.hasLiked = false,
    this.isPinned = false,
    this.isAnswered = false,
    this.isKnowledgeBase = false,
    required this.createdAt,
    this.comments = const [],
  });

  factory ForumPost.fromJson(Map<String, dynamic> json) {
    final comments = json['comments'];
    final imageUrls = json['imageUrls'];
    final videoUrls = json['videoUrls'];
    final attachmentUrls = json['attachmentUrls'];

    return ForumPost(
      id: json['id']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      content: json['content']?.toString() ?? '',
      category: json['category']?.toString(),
      type: PostType.values.firstWhere(
        (e) => e.toString() == 'PostType.${json['type']}',
        orElse: () => PostType.COMMUNITY_POST,
      ),
      priority: json['priority']?.toString() ?? 'normal',
      audienceType: PostAudience.values.firstWhere(
        (e) => e.toString() == 'PostAudience.${json['audienceType']}',
        orElse: () => PostAudience.GLOBAL,
      ),
      audienceId: json['audienceId']?.toString(),
      authorId: json['authorId']?.toString() ?? '',
      authorName: json['authorName']?.toString() ?? '',
      authorRole: json['authorRole']?.toString() ?? 'farmer',
      authorAvatar: json['authorAvatar']?.toString(),
      authorFarm: json['authorFarm']?.toString(),
      authorDistrict: json['authorDistrict']?.toString(),
      imageUrls: imageUrls is List ? List<String>.from(imageUrls) : const [],
      videoUrls: videoUrls is List ? List<String>.from(videoUrls) : const [],
      attachmentUrls:
          attachmentUrls is List ? List<String>.from(attachmentUrls) : const [],
      commentCount: int.tryParse(json['commentCount']?.toString() ?? '') ?? 0,
      likeCount: int.tryParse(json['likeCount']?.toString() ?? '') ?? 0,
      viewCount: int.tryParse(json['viewCount']?.toString() ?? '') ?? 0,
      hasLiked: json['hasLiked'] == true,
      isPinned: json['isPinned'] == true,
      isAnswered: json['isAnswered'] == true,
      isKnowledgeBase: json['isKnowledgeBase'] == true,
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

  ForumPost copyWith({
    List<ForumComment>? comments,
    int? commentCount,
    int? likeCount,
    bool? hasLiked,
  }) {
    return ForumPost(
      id: id,
      title: title,
      content: content,
      category: category,
      type: type,
      priority: priority,
      audienceType: audienceType,
      audienceId: audienceId,
      authorId: authorId,
      authorName: authorName,
      authorRole: authorRole,
      authorAvatar: authorAvatar,
      authorFarm: authorFarm,
      authorDistrict: authorDistrict,
      imageUrls: imageUrls,
      videoUrls: videoUrls,
      attachmentUrls: attachmentUrls,
      commentCount: commentCount ?? this.commentCount,
      likeCount: likeCount ?? this.likeCount,
      viewCount: viewCount,
      hasLiked: hasLiked ?? this.hasLiked,
      isPinned: isPinned,
      isAnswered: isAnswered,
      isKnowledgeBase: isKnowledgeBase,
      createdAt: createdAt,
      comments: comments ?? this.comments,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'content': content,
        'category': category,
        'type': type.toString().split('.').last,
        'priority': priority,
        'audienceType': audienceType.toString().split('.').last,
        'audienceId': audienceId,
        'authorId': authorId,
        'authorName': authorName,
        'authorRole': authorRole,
        'authorAvatar': authorAvatar,
        'authorFarm': authorFarm,
        'authorDistrict': authorDistrict,
        'imageUrls': imageUrls,
        'videoUrls': videoUrls,
        'attachmentUrls': attachmentUrls,
        'commentCount': commentCount,
        'likeCount': likeCount,
        'viewCount': viewCount,
        'hasLiked': hasLiked,
        'isPinned': isPinned,
        'isAnswered': isAnswered,
        'isKnowledgeBase': isKnowledgeBase,
        'createdAt': createdAt.toIso8601String(),
        'comments': comments.map((comment) => comment.toJson()).toList(),
      };

  @override
  List<Object?> get props => [
        id,
        title,
        content,
        category,
        type,
        priority,
        audienceType,
        audienceId,
        authorId,
        authorName,
        authorRole,
        authorAvatar,
        authorFarm,
        authorDistrict,
        imageUrls,
        videoUrls,
        attachmentUrls,
        commentCount,
        likeCount,
        viewCount,
        hasLiked,
        isPinned,
        isAnswered,
        isKnowledgeBase,
        createdAt,
        comments,
      ];
}
