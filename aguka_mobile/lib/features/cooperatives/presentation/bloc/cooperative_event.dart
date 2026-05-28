import 'package:equatable/equatable.dart';

abstract class CooperativeEvent extends Equatable {
  const CooperativeEvent();

  @override
  List<Object?> get props => [];
}

class FetchMyCooperative extends CooperativeEvent {}

class AddCooperativeMember extends CooperativeEvent {
  final String cooperativeId;
  final String phone;
  final String fullName;

  const AddCooperativeMember({
    required this.cooperativeId,
    required this.phone,
    required this.fullName,
  });

  @override
  List<Object?> get props => [cooperativeId, phone, fullName];
}
