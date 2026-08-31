import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/cooperative_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/dashboard_cards.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/cooperative_dashboard_data.dart';

class CooperativeDashboardContent extends StatelessWidget {
  const CooperativeDashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        return RefreshIndicator(
          onRefresh: () async {
            final authState = context.read<AuthBloc>().state;
            if (authState is AuthAuthenticated) {
              context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
              context.read<CooperativeBloc>().add(FetchMyCooperative());
              // CooperativeDashboardBloc is re-triggered by the BlocListener
              // in DashboardView when CooperativeBloc emits loaded state.
            }
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              BlocBuilder<CooperativeDashboardBloc, CooperativeDashboardState>(
                buildWhen: (prev, curr) => prev.status != curr.status,
                builder: (context, dashState) {
                  if (dashState.status != CooperativeDashboardStatus.error) {
                    return const SizedBox.shrink();
                  }
                  final coopId = context.read<CooperativeBloc>().state.cooperative?.id ?? '';
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red.shade600, size: 18),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            dashState.errorMessage ?? 'Failed to load dashboard data.',
                            style: TextStyle(fontSize: 12, color: Colors.red.shade800),
                          ),
                        ),
                        TextButton(
                          style: TextButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            minimumSize: Size.zero,
                            tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          ),
                          onPressed: coopId.isNotEmpty
                              ? () => context
                                  .read<CooperativeDashboardBloc>()
                                  .add(FetchCooperativeDashboard(coopId))
                              : null,
                          child: Text(
                            'Retry',
                            style: TextStyle(color: Colors.red.shade700, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              _buildHeader(context),
              const SizedBox(height: 16),
              _buildStatGrid(context),
              const SizedBox(height: 20),
              _buildLeaderboardSection(context),
              const SizedBox(height: 20),
              _buildNetworkOverviewSection(context),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    final coopState = context.watch<CooperativeBloc>().state;
    final coopName = coopState.cooperative?.name ?? '';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          coopName.isNotEmpty ? coopName : 'Cooperative Command Center',
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Aggregated oversight of your cooperative network and member performance.',
          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildStatGrid(BuildContext context) {
    final coopState = context.watch<CooperativeBloc>().state;
    final coopDashState = context.watch<CooperativeDashboardBloc>().state;
    final data = coopDashState.data;

    // Use totalMembers from dashboard stats; fall back to cooperative.memberCount.
    final memberCount = data.totalMembers > 0
        ? data.totalMembers
        : (coopState.cooperative?.memberCount ?? 0);

    final activeHectares = data.activeHectares > 0
        ? data.activeHectares.toStringAsFixed(1)
        : '0';

    final networkYield = data.networkYield > 0
        ? '${data.networkYield.toStringAsFixed(0)} RWF'
        : '0 RWF';

    final sharedAssets = data.sharedAssets;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.6,
      children: [
        StatCard(
          label: 'Total Members',
          value: '$memberCount',
          icon: Icons.people,
          color: const Color(0xFF1D9E75),
        ),
        StatCard(
          label: 'Active Hectares',
          value: activeHectares,
          icon: Icons.square_foot,
          color: const Color(0xFF27AE60),
        ),
        StatCard(
          label: 'Network Yield',
          value: networkYield,
          icon: Icons.trending_up,
          color: const Color(0xFF2980B9),
        ),
        StatCard(
          label: 'Shared Assets',
          value: '$sharedAssets',
          icon: Icons.widgets,
          color: const Color(0xFFF39C12),
        ),
      ],
    );
  }

  Widget _buildLeaderboardSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Member Performance Rankings'),
        const SizedBox(height: 10),
        BlocBuilder<CooperativeDashboardBloc, CooperativeDashboardState>(
          builder: (context, state) {
            final leaderboard = state.data.leaderboard;

            if (leaderboard.isEmpty) {
              // Fall back to member list if dashboard leaderboard not yet loaded.
              return BlocBuilder<CooperativeBloc, CooperativeState>(
                builder: (context, coopState) {
                  final members = coopState.members;
                  if (members.isEmpty) {
                    return Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey[200]!),
                      ),
                      child: Text(
                        'No members yet.',
                        style: TextStyle(color: Colors.grey[500], fontSize: 13),
                      ),
                    );
                  }
                  return Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Column(
                      children: members.take(5).toList().asMap().entries.map((entry) {
                        final rank = entry.key + 1;
                        final member = entry.value;
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: _memberRow(rank: rank, name: member.fullName, subtitle: member.status, score: null),
                        );
                      }).toList(),
                    ),
                  );
                },
              );
            }

            return Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey[200]!),
              ),
              child: Column(
                children: leaderboard.take(5).toList().asMap().entries.map((entry) {
                  final rank = entry.key + 1;
                  final item = entry.value;
                  final subtitle = '${item.totalCrops} crop${item.totalCrops != 1 ? 's' : ''} · ${item.totalAreaHectares.toStringAsFixed(1)} ha';
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: _memberRow(rank: rank, name: item.farmerName, subtitle: subtitle, score: item.score),
                  );
                }).toList(),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _memberRow({
    required int rank,
    required String name,
    required String subtitle,
    int? score,
  }) {
    Color rankColor;
    String rankLabel;
    if (rank == 1) {
      rankColor = const Color(0xFFFFD700);
      rankLabel = '🥇';
    } else if (rank == 2) {
      rankColor = const Color(0xFFC0C0C0);
      rankLabel = '🥈';
    } else if (rank == 3) {
      rankColor = const Color(0xFFCD7F32);
      rankLabel = '🥉';
    } else {
      rankColor = Colors.grey;
      rankLabel = '$rank';
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: rankColor.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                rankLabel,
                style: TextStyle(
                  fontSize: rank <= 3 ? 15 : 12,
                  color: rankColor,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
                if (subtitle.isNotEmpty)
                  Text(
                    subtitle,
                    style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          if (score != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: const Color(0xFF1D9E75).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(99),
              ),
              child: Text(
                '$score',
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1D9E75),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildNetworkOverviewSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Network Overview'),
        const SizedBox(height: 10),
        BlocBuilder<CooperativeDashboardBloc, CooperativeDashboardState>(
          builder: (context, state) {
            final data = state.data;
            return Column(
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        const Color(0xFF1D9E75).withValues(alpha: 0.05),
                        const Color(0xFF1D9E75).withValues(alpha: 0.02),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: const Color(0xFF1D9E75).withValues(alpha: 0.15),
                    ),
                  ),
                  child: Column(
                    children: [
                      _progressTile(
                        label: 'Avg Soil Moisture',
                        progress: (data.avgSoilMoisture / 100).clamp(0.0, 1.0),
                        color: const Color(0xFF3498DB),
                        valueLabel: '${data.avgSoilMoisture.toStringAsFixed(1)}%',
                      ),
                      const SizedBox(height: 14),
                      _progressTile(
                        label: 'Resource Utilization',
                        progress: (data.resourceUtilization / 100).clamp(0.0, 1.0),
                        color: const Color(0xFF1D9E75),
                        valueLabel: '${data.resourceUtilization}%',
                      ),
                    ],
                  ),
                ),
                if (data.upcomingEvents.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.grey[200]!),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Upcoming Events',
                          style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 10),
                        ...data.upcomingEvents.take(3).map((event) {
                          final dateStr = '${event.scheduledAt.day} ${_month(event.scheduledAt.month)} ${event.scheduledAt.year}';
                          final locationLabel = event.location != null && event.location!.isNotEmpty
                              ? ' · ${event.location}'
                              : '';
                          return Column(
                            children: [
                              _eventRow(
                                title: event.title,
                                dateLabel: '$dateStr$locationLabel',
                              ),
                              if (event != data.upcomingEvents.last && data.upcomingEvents.indexOf(event) < 2)
                                const Divider(height: 12),
                            ],
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _eventRow({required String title, required String dateLabel}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: const Color(0xFF3498DB).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Icon(Icons.event, size: 16, color: Color(0xFF3498DB)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  dateLabel,
                  style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _month(int m) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[m - 1];
  }

  Widget _progressTile({
    required String label,
    required double progress,
    required Color color,
    required String valueLabel,
  }) {
    return Row(
      children: [
        Expanded(
          flex: 4,
          child: Text(
            label,
            style: TextStyle(fontSize: 12, color: Colors.grey[700]),
            overflow: TextOverflow.ellipsis,
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          flex: 5,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(color),
              minHeight: 10,
            ),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          width: 44,
          child: Text(
            valueLabel,
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color),
            textAlign: TextAlign.right,
          ),
        ),
      ],
    );
  }
}
