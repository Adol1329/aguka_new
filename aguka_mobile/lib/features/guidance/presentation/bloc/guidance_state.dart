import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';

enum GuidanceStatus { initial, loading, loaded, error }

class GuidanceState extends Equatable {
  final GuidanceStatus status;
  final List<CropModel> crops;
  final List<LivestockModel> livestock;
  final CropGuidanceModel? cropGuidance;
  final LivestockGuidanceModel? livestockGuidance;
  final String? errorMessage;

  const GuidanceState({
    this.status = GuidanceStatus.initial,
    this.crops = const [],
    this.livestock = const [],
    this.cropGuidance,
    this.livestockGuidance,
    this.errorMessage,
  });

  GuidanceState copyWith({
    GuidanceStatus? status,
    List<CropModel>? crops,
    List<LivestockModel>? livestock,
    CropGuidanceModel? cropGuidance,
    LivestockGuidanceModel? livestockGuidance,
    String? errorMessage,
  }) {
    return GuidanceState(
      status: status ?? this.status,
      crops: crops ?? this.crops,
      livestock: livestock ?? this.livestock,
      cropGuidance: cropGuidance ?? this.cropGuidance,
      livestockGuidance: livestockGuidance ?? this.livestockGuidance,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        crops,
        livestock,
        cropGuidance,
        livestockGuidance,
        errorMessage,
      ];
}
