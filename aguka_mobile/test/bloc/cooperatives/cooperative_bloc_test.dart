import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/cooperatives/domain/usecases/cooperative_usecases.dart';
import 'package:aguka_mobile/features/cooperatives/data/models/cooperative_model.dart';


@GenerateMocks([
  GetMyCooperativeUseCase,
  GetCooperativeMembersUseCase,
  AddCooperativeMemberUseCase,
])
import 'cooperative_bloc_test.mocks.dart';

void main() {
  late MockGetMyCooperativeUseCase mockGetCoop;
  late MockGetCooperativeMembersUseCase mockGetMembers;
  late MockAddCooperativeMemberUseCase mockAddMember;

  setUp(() {
    mockGetCoop = MockGetMyCooperativeUseCase();
    mockGetMembers = MockGetCooperativeMembersUseCase();
    mockAddMember = MockAddCooperativeMemberUseCase();
  });

  CooperativeBloc buildBloc() => CooperativeBloc(
        getMyCooperativeUseCase: mockGetCoop,
        getMembersUseCase: mockGetMembers,
        addMemberUseCase: mockAddMember,
      );

  test('initial state has status == initial', () {
    expect(buildBloc().state.status, equals(CooperativeStatus.initial));
  });

  group('FetchMyCooperative', () {
    final coop = CooperativeModel.mock();
    final members = CooperativeMemberModel.mockList();

    blocTest<CooperativeBloc, CooperativeState>(
      'emits [loading, loaded] with cooperative and members',
      build: buildBloc,
      setUp: () {
        when(mockGetCoop(any)).thenAnswer((_) async => Right(coop));
        when(mockGetMembers(coop.id)).thenAnswer((_) async => Right(members));
      },
      act: (bloc) => bloc.add(FetchMyCooperative()),
      expect: () => [
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loading),
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.cooperative, isNotNull);
        expect(bloc.state.members, isNotEmpty);
        expect(bloc.state.cooperative!.name, isNotEmpty);
      },
    );

    blocTest<CooperativeBloc, CooperativeState>(
      'emits [loading, error] when cooperative fetch fails',
      build: buildBloc,
      setUp: () {
        when(mockGetCoop(any))
            .thenAnswer((_) async => Left(ServerFailure('Not found')));
      },
      act: (bloc) => bloc.add(FetchMyCooperative()),
      expect: () => [
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loading),
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.error),
      ],
      verify: (bloc) {
        expect(bloc.state.errorMessage, equals('Not found'));
        expect(bloc.state.cooperative, isNull);
      },
    );

    blocTest<CooperativeBloc, CooperativeState>(
      'loaded with empty members list if member fetch fails',
      build: buildBloc,
      setUp: () {
        when(mockGetCoop(any)).thenAnswer((_) async => Right(coop));
        when(mockGetMembers(coop.id))
            .thenAnswer((_) async => Left(ServerFailure('Members unavailable')));
      },
      act: (bloc) => bloc.add(FetchMyCooperative()),
      expect: () => [
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loading),
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.cooperative, isNotNull);
        expect(bloc.state.members, isEmpty);
      },
    );
  });

  group('AddCooperativeMember', () {
    final addEvent = AddCooperativeMember(
      cooperativeId: 'coop-001',
      phone: '+250788999888',
      fullName: 'Test Farmer',
    );

    blocTest<CooperativeBloc, CooperativeState>(
      'adds member and refreshes members list',
      build: buildBloc,
      seed: () => CooperativeState(
        status: CooperativeStatus.loaded,
        cooperative: CooperativeModel.mock(),
        members: CooperativeMemberModel.mockList(),
      ),
      setUp: () {
        when(mockAddMember(any))
            .thenAnswer((_) async => const Right(null));
        when(mockGetCoop(any))
            .thenAnswer((_) async => Right(CooperativeModel.mock()));
        when(mockGetMembers(any))
            .thenAnswer((_) async => Right(CooperativeMemberModel.mockList()));
      },
      act: (bloc) => bloc.add(addEvent),
      expect: () => [
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loading),
        predicate<CooperativeState>((s) => s.status == CooperativeStatus.loaded),
      ],
    );
  });
}
