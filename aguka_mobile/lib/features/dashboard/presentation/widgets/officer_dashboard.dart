import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/officer_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/dashboard_cards.dart';
import 'package:aguka_mobile/features/field_visits/presentation/bloc/field_visit_bloc.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';
import 'package:aguka_mobile/features/risks/presentation/bloc/risk_bloc.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';

class OfficerDashboardContent extends StatelessWidget {
  const OfficerDashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<DashboardBloc, DashboardState>(
      builder: (context, state) {
        return RefreshIndicator(
          onRefresh: () async {
            final authState = context.read<AuthBloc>().state;
            if (authState is AuthAuthenticated) {
              context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
              context.read<FieldVisitBloc>().add(FetchFieldVisits());
              context.read<RiskBloc>().add(FetchActiveRisks());
              context.read<OfficerDashboardBloc>().add(FetchOfficerDashboard());
            }
          },
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
            children: [
              _buildHeader(context),
              const SizedBox(height: 16),
              _buildStatGrid(context),
              const SizedBox(height: 20),
              _buildFieldVisitsSection(context),
              const SizedBox(height: 20),
              _buildRecentActivitiesSection(context),
              const SizedBox(height: 20),
              _buildRiskSummarySection(context),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Field Officer Dashboard',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          'Operational overview of your assigned farmers and field activities.',
          style: TextStyle(fontSize: 13, color: Colors.grey[600]),
        ),
      ],
    );
  }

  Widget _buildStatGrid(BuildContext context) {
    final officerState = context.watch<OfficerDashboardBloc>().state;
    final fvState = context.watch<FieldVisitBloc>().state;
    final riskState = context.watch<RiskBloc>().state;

    final data = officerState.data;
    final assignedFarmers = data.assignedFarmers;
    final farmsMonitored = data.farmsMonitored;

    // Use pre-computed stats from dashboard endpoint when available,
    // fall back to counting from the separate blocs while loading.
    final pendingVisits = data.pendingVisits > 0
        ? data.pendingVisits
        : fvState.visits.where((v) => (v.status ?? '').toLowerCase() == 'pending').length;
    final activeRisks = data.activeRisks > 0
        ? data.activeRisks
        : riskState.risks.length;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.6,
      children: [
        StatCard(
          label: 'Assigned Farmers',
          value: '$assignedFarmers',
          icon: Icons.people,
          color: const Color(0xFF1D9E75),
        ),
        StatCard(
          label: 'Farms Monitored',
          value: '$farmsMonitored',
          icon: Icons.agriculture,
          color: const Color(0xFF27AE60),
        ),
        StatCard(
          label: 'Pending Visits',
          value: '$pendingVisits',
          icon: Icons.list_alt,
          color: const Color(0xFFE67E22),
        ),
        StatCard(
          label: 'Active Risks',
          value: '$activeRisks',
          icon: Icons.warning,
          color: const Color(0xFFE74C3C),
        ),
      ],
    );
  }

  Widget _buildFieldVisitsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Pending Field Visits'),
        const SizedBox(height: 10),
        BlocBuilder<FieldVisitBloc, FieldVisitState>(
          builder: (context, state) {
            final pending = state.visits
                .where((v) => (v.status ?? '').toLowerCase() == 'pending')
                .take(4)
                .toList();

            if (pending.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(
                  'No pending field visits.',
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
                children: pending.map((visit) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: _visitRow(visit),
                )).toList(),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _visitRow(FieldVisitEntity visit) {
    final dateStr = '${visit.scheduledDate.day} ${_monthAbbr(visit.scheduledDate.month)} ${visit.scheduledDate.year}';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          const Icon(Icons.calendar_today, size: 16, color: Color(0xFFE67E22)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  visit.farmerName,
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  'Scheduled $dateStr',
                  style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                ),
              ],
            ),
          ),
          if (visit.farmName != null && visit.farmName!.isNotEmpty)
            Text(
              visit.farmName!,
              style: TextStyle(fontSize: 10, color: Colors.grey[400]),
              overflow: TextOverflow.ellipsis,
            ),
        ],
      ),
    );
  }

  String _monthAbbr(int month) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  }

  Widget _buildRecentActivitiesSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Recent Activities'),
        const SizedBox(height: 10),
        // Use FieldVisitBloc (last 5 visits) to match web behaviour —
        // analysis.recentActivities from OfficerDashboardBloc is typically empty.
        BlocBuilder<FieldVisitBloc, FieldVisitState>(
          builder: (context, state) {
            final recent = state.visits.take(5).toList();
            if (recent.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(
                  'No recent field activities.',
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
                children: recent.asMap().entries.map((entry) {
                  final i = entry.key;
                  final visit = entry.value;
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (i > 0) const Divider(height: 12),
                      _recentVisitRow(visit),
                    ],
                  );
                }).toList(),
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _recentVisitRow(FieldVisitEntity visit) {
    final status = visit.status ?? 'pending';
    final isCompleted = status.toLowerCase() == 'completed';
    final statusBg = isCompleted ? const Color(0xFFD1FAE5) : const Color(0xFFF1F5F9);
    final statusText = isCompleted ? const Color(0xFF065F46) : const Color(0xFF475569);
    final dateStr = '${visit.scheduledDate.day} ${_monthAbbr(visit.scheduledDate.month)} ${visit.scheduledDate.year}';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  visit.farmerName,
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: statusBg,
                  borderRadius: BorderRadius.circular(99),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: statusText),
                ),
              ),
            ],
          ),
          if (visit.notes != null && visit.notes!.isNotEmpty)
            Text(
              visit.notes!,
              style: TextStyle(fontSize: 11, color: Colors.grey[600]),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          Text(
            dateStr,
            style: TextStyle(fontSize: 10, color: Colors.grey[400]),
          ),
        ],
      ),
    );
  }

  Widget _buildRiskSummarySection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'High-Level Risk Summary'),
        const SizedBox(height: 10),
        BlocBuilder<RiskBloc, RiskState>(
          builder: (context, state) {
            if (state.risks.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(
                  'No active agricultural or climate risks detected.',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              );
            }
            return GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 1.3,
              children: state.risks.take(6).map((risk) => _riskTile(risk)).toList(),
            );
          },
        ),
      ],
    );
  }

  Widget _riskTile(RiskEntity risk) {
    // Backend sends lowercase severity — compare case-insensitively.
    final severityUpper = risk.severity.toUpperCase();
    final severityColor = severityUpper == 'CRITICAL'
        ? const Color(0xFFE74C3C)
        : severityUpper == 'WARNING' || severityUpper == 'WARN'
            ? const Color(0xFFE67E22)
            : const Color(0xFF3498DB);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: severityColor.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: severityColor.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(color: severityColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 6),
              Flexible(
                child: Text(
                  severityUpper,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: severityColor,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            risk.label,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (risk.location != null && risk.location!.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              risk.location!,
              style: TextStyle(fontSize: 11, color: Colors.grey[600]),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (risk.detectedAt != null) ...[
            const SizedBox(height: 4),
            Text(
              '${risk.detectedAt!.day} ${_monthAbbr(risk.detectedAt!.month)} ${risk.detectedAt!.year}',
              style: TextStyle(fontSize: 10, color: Colors.grey[400]),
            ),
          ],
        ],
      ),
    );
  }
}
