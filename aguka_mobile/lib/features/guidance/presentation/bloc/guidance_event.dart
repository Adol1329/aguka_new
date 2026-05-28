import 'package:equatable/equatable.dart';

abstract class GuidanceEvent extends Equatable {
  const GuidanceEvent();

  @override
  List<Object?> get props => [];
}

class FetchGuidanceOverview extends GuidanceEvent {}

class FetchCropGuidance extends GuidanceEvent {
  final String farmerCropId;

  const FetchCropGuidance(this.farmerCropId);

  @override
  List<Object?> get props => [farmerCropId];
}

class FetchLivestockGuidance extends GuidanceEvent {
  final String livestockId;

  const FetchLivestockGuidance(this.livestockId);

  @override
  List<Object?> get props => [livestockId];
}
