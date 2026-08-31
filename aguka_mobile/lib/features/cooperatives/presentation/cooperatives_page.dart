import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';
import 'package:aguka_mobile/injection_container.dart';

class CooperativesPage extends StatelessWidget {
  const CooperativesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthBloc>().state;
    final role = authState is AuthAuthenticated ? authState.user.role : 'farmer';
    final isManager = role == 'cooperative_manager' || role == 'cooperative';

    return BlocProvider(
      create: (context) {
        final bloc = sl<CooperativeBloc>();
        if (isManager) {
          bloc.add(FetchMyCooperative());
        } else {
          bloc.add(FetchMyCooperative()); // try to fetch their cooperative
          bloc.add(FetchCooperativeList()); // also load list for browsing
        }
        return bloc;
      },
      child: isManager
          ? const _ManagerCooperativesView()
          : const _FarmerCooperativesView(),
    );
  }
}

// ─── COOPERATIVE MANAGER VIEW ─────────────────────────────────────────────────

class _ManagerCooperativesView extends StatefulWidget {
  const _ManagerCooperativesView();

  @override
  State<_ManagerCooperativesView> createState() => _ManagerCooperativesViewState();
}

class _ManagerCooperativesViewState extends State<_ManagerCooperativesView>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AgukaAppBar(
        title: 'Cooperative Hub',
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.green.shade700,
          labelColor: Colors.green.shade800,
          unselectedLabelColor: Colors.grey,
          isScrollable: false,
          tabs: const [
            Tab(icon: Icon(Icons.people_outline, size: 20), text: 'Members'),
            Tab(icon: Icon(Icons.person_add_outlined, size: 20), text: 'Requests'),
            Tab(icon: Icon(Icons.event_outlined, size: 20), text: 'Events'),
            Tab(icon: Icon(Icons.inventory_2_outlined, size: 20), text: 'Resources'),
          ],
        ),
      ),
      body: BlocBuilder<CooperativeBloc, CooperativeState>(
        builder: (context, state) {
          if (state.status == CooperativeStatus.loading ||
              state.status == CooperativeStatus.initial) {
            return const Center(child: CircularProgressIndicator());
          }
          if (state.status == CooperativeStatus.error) {
            return _ErrorView(
              message: state.errorMessage ?? 'Failed to load cooperative',
              onRetry: () => context.read<CooperativeBloc>().add(FetchMyCooperative()),
            );
          }
          return Column(
            children: [
              if (state.cooperative != null)
                _CoopHeaderBanner(coop: state.cooperative!),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: [
                    _MembersTab(
                      members: state.members,
                      cooperativeId: state.cooperative?.id ?? '',
                    ),
                    _JoinRequestsTab(
                      requests: state.joinRequests,
                      cooperativeId: state.cooperative?.id ?? '',
                    ),
                    _EventsTab(
                      activities: state.activities,
                      cooperativeId: state.cooperative?.id ?? '',
                    ),
                    _ResourcesTab(
                      resources: state.resources,
                      cooperativeId: state.cooperative?.id ?? '',
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: _ManagerFAB(tabController: _tabController),
    );
  }
}

class _CoopHeaderBanner extends StatelessWidget {
  final CooperativeEntity coop;
  const _CoopHeaderBanner({required this.coop});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: Colors.green.shade800,
      child: Row(
        children: [
          CircleAvatar(
            radius: 22,
            backgroundColor: Colors.white24,
            child: Icon(Icons.groups, color: Colors.white, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(coop.name,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.bold),
                    overflow: TextOverflow.ellipsis),
                Text(
                  '${coop.district ?? ''} · Reg: ${coop.registrationNumber}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
          _StatBadge(value: '${coop.memberCount}', label: 'Members'),
        ],
      ),
    );
  }
}

class _StatBadge extends StatelessWidget {
  final String value;
  final String label;
  const _StatBadge({required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value,
            style: const TextStyle(
                color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
      ],
    );
  }
}

// ─── MEMBERS TAB ──────────────────────────────────────────────────────────────

class _MembersTab extends StatelessWidget {
  final List<CooperativeMemberEntity> members;
  final String cooperativeId;
  const _MembersTab({required this.members, required this.cooperativeId});

  @override
  Widget build(BuildContext context) {
    if (members.isEmpty) {
      return _EmptyState(
        icon: Icons.people_outline,
        message: 'No members yet.',
        subtitle: 'Add farmers to your cooperative.',
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: members.length,
      separatorBuilder: (_, __) => const SizedBox(height: 8),
      itemBuilder: (context, i) => _MemberCard(member: members[i],
          cooperativeId: cooperativeId),
    );
  }
}

class _MemberCard extends StatelessWidget {
  final CooperativeMemberEntity member;
  final String cooperativeId;
  const _MemberCard({required this.member, required this.cooperativeId});

  Color _statusColor(String status) {
    switch (status) {
      case 'active': return Colors.green;
      case 'suspended': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 1,
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green.shade50,
          child: Text(
            member.fullName.isNotEmpty ? member.fullName[0].toUpperCase() : '?',
            style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.bold),
          ),
        ),
        title: Text(member.fullName,
            style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(member.phone,
            style: const TextStyle(fontSize: 12)),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Chip(
              label: Text(member.role,
                  style: const TextStyle(fontSize: 10)),
              backgroundColor: Colors.green.shade50,
              padding: EdgeInsets.zero,
              visualDensity: VisualDensity.compact,
            ),
            const SizedBox(height: 2),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: _statusColor(member.status),
                shape: BoxShape.circle,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── JOIN REQUESTS TAB ────────────────────────────────────────────────────────

class _JoinRequestsTab extends StatefulWidget {
  final List<JoinRequestEntity> requests;
  final String cooperativeId;
  const _JoinRequestsTab({required this.requests, required this.cooperativeId});

  @override
  State<_JoinRequestsTab> createState() => _JoinRequestsTabState();
}

class _JoinRequestsTabState extends State<_JoinRequestsTab> {
  @override
  void initState() {
    super.initState();
    if (widget.cooperativeId.isNotEmpty) {
      context.read<CooperativeBloc>().add(FetchJoinRequests(widget.cooperativeId));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CooperativeBloc, CooperativeState>(
      builder: (context, state) {
        final requests = state.joinRequests;
        if (requests.isEmpty) {
          return _EmptyState(
            icon: Icons.check_circle_outline,
            message: 'No pending requests',
            subtitle: 'All membership requests have been reviewed.',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: requests.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) => _JoinRequestCard(
            request: requests[i],
            cooperativeId: widget.cooperativeId,
          ),
        );
      },
    );
  }
}

class _JoinRequestCard extends StatelessWidget {
  final JoinRequestEntity request;
  final String cooperativeId;
  const _JoinRequestCard({required this.request, required this.cooperativeId});

  @override
  Widget build(BuildContext context) {
    final daysAgo = DateTime.now().difference(request.requestedAt).inDays;
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.blue.shade50,
                  child: Text(
                    request.fullName.isNotEmpty
                        ? request.fullName[0].toUpperCase()
                        : '?',
                    style: TextStyle(color: Colors.blue.shade800,
                        fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.fullName,
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text(request.phone,
                          style: const TextStyle(fontSize: 12,
                              color: Colors.grey)),
                    ],
                  ),
                ),
                Text(
                  daysAgo == 0
                      ? 'Today'
                      : '$daysAgo day${daysAgo != 1 ? 's' : ''} ago',
                  style: const TextStyle(fontSize: 11, color: Colors.grey),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () => context.read<CooperativeBloc>().add(
                        RejectJoinRequest(
                            cooperativeId: cooperativeId,
                            requestId: request.id)),
                    icon: const Icon(Icons.close, size: 16, color: Colors.red),
                    label: const Text('Decline',
                        style: TextStyle(color: Colors.red)),
                    style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.red)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => context.read<CooperativeBloc>().add(
                        ApproveJoinRequest(
                            cooperativeId: cooperativeId,
                            requestId: request.id)),
                    icon: const Icon(Icons.check, size: 16),
                    label: const Text('Approve'),
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green.shade700,
                        foregroundColor: Colors.white),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── EVENTS TAB ───────────────────────────────────────────────────────────────

class _EventsTab extends StatefulWidget {
  final List<CooperativeActivityEntity> activities;
  final String cooperativeId;
  const _EventsTab({required this.activities, required this.cooperativeId});

  @override
  State<_EventsTab> createState() => _EventsTabState();
}

class _EventsTabState extends State<_EventsTab> {
  @override
  void initState() {
    super.initState();
    if (widget.cooperativeId.isNotEmpty) {
      context.read<CooperativeBloc>().add(
          FetchCooperativeActivities(widget.cooperativeId));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CooperativeBloc, CooperativeState>(
      builder: (context, state) {
        final activities = state.activities;
        if (activities.isEmpty) {
          return _EmptyState(
            icon: Icons.event_outlined,
            message: 'No events scheduled',
            subtitle: 'Schedule meetings, training, and harvest events.',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: activities.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) => _ActivityCard(activity: activities[i]),
        );
      },
    );
  }
}

class _ActivityCard extends StatelessWidget {
  final CooperativeActivityEntity activity;
  const _ActivityCard({required this.activity});

  Color _typeColor(String type) {
    switch (type) {
      case 'meeting': return Colors.blue;
      case 'training': return Colors.purple;
      case 'harvest': return Colors.orange;
      case 'planting': return Colors.green;
      default: return Colors.grey;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'meeting': return Icons.groups_outlined;
      case 'training': return Icons.school_outlined;
      case 'harvest': return Icons.agriculture_outlined;
      case 'planting': return Icons.grass_outlined;
      default: return Icons.event_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = _typeColor(activity.activityType);
    final date = activity.scheduledAt;
    final dateStr =
        '${date.day} ${_month(date.month)} ${date.year}';

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(_typeIcon(activity.activityType),
                  color: color, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(activity.title,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(Icons.calendar_today_outlined,
                          size: 12, color: Colors.grey[500]),
                      const SizedBox(width: 4),
                      Text(dateStr,
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey[600])),
                      if (activity.location != null) ...[
                        const SizedBox(width: 8),
                        Icon(Icons.location_on_outlined,
                            size: 12, color: Colors.grey[500]),
                        const SizedBox(width: 2),
                        Flexible(
                          child: Text(activity.location!,
                              style: TextStyle(
                                  fontSize: 12, color: Colors.grey[600]),
                              overflow: TextOverflow.ellipsis),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            Column(
              children: [
                Text('${activity.expectedParticipants}',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold, fontSize: 16)),
                Text('expected',
                    style:
                        TextStyle(fontSize: 10, color: Colors.grey[500])),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _month(int m) {
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];
    return months[m - 1];
  }
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────

class _ResourcesTab extends StatefulWidget {
  final List<CooperativeResourceEntity> resources;
  final String cooperativeId;
  const _ResourcesTab({required this.resources, required this.cooperativeId});

  @override
  State<_ResourcesTab> createState() => _ResourcesTabState();
}

class _ResourcesTabState extends State<_ResourcesTab> {
  @override
  void initState() {
    super.initState();
    if (widget.cooperativeId.isNotEmpty) {
      context.read<CooperativeBloc>().add(
          FetchCooperativeResources(widget.cooperativeId));
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CooperativeBloc, CooperativeState>(
      builder: (context, state) {
        final resources = state.resources;
        if (resources.isEmpty) {
          return _EmptyState(
            icon: Icons.inventory_2_outlined,
            message: 'No resources yet',
            subtitle: 'Add seeds, fertilizers, and equipment.',
          );
        }
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: resources.length,
          separatorBuilder: (_, __) => const SizedBox(height: 8),
          itemBuilder: (context, i) => _ResourceCard(resource: resources[i]),
        );
      },
    );
  }
}

class _ResourceCard extends StatelessWidget {
  final CooperativeResourceEntity resource;
  const _ResourceCard({required this.resource});

  Color _statusColor(String status) {
    switch (status) {
      case 'available': return Colors.green;
      case 'low_stock': return Colors.orange;
      case 'out_of_stock': return Colors.red;
      default: return Colors.grey;
    }
  }

  String _statusLabel(String status) {
    switch (status) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'out_of_stock': return 'Out of Stock';
      default: return status;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'equipment': return Icons.build_outlined;
      case 'storage': return Icons.warehouse_outlined;
      case 'transport': return Icons.local_shipping_outlined;
      default: return Icons.science_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _statusColor(resource.status);
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      elevation: 1,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(_typeIcon(resource.resourceType),
                  color: Colors.green.shade700, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(resource.name,
                      style: const TextStyle(
                          fontWeight: FontWeight.w600, fontSize: 14)),
                  if (resource.category != null)
                    Text(resource.category!,
                        style: TextStyle(
                            fontSize: 12, color: Colors.grey[500])),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(99),
                    ),
                    child: Text(
                      _statusLabel(resource.status),
                      style: TextStyle(
                          fontSize: 11,
                          color: statusColor,
                          fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  resource.availableQuantity % 1 == 0
                      ? resource.availableQuantity.toInt().toString()
                      : resource.availableQuantity.toStringAsFixed(1),
                  style: const TextStyle(
                      fontWeight: FontWeight.bold, fontSize: 18),
                ),
                Text(resource.unit ?? '',
                    style: TextStyle(fontSize: 11, color: Colors.grey[500])),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ─── MANAGER FAB ──────────────────────────────────────────────────────────────

class _ManagerFAB extends StatelessWidget {
  final TabController tabController;
  const _ManagerFAB({required this.tabController});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: tabController,
      builder: (context, _) {
        switch (tabController.index) {
          case 0:
            return FloatingActionButton.extended(
              onPressed: () => _showAddMemberDialog(context),
              label: const Text('Add Member'),
              icon: const Icon(Icons.person_add),
              backgroundColor: Colors.green.shade700,
            );
          case 2:
            return FloatingActionButton.extended(
              onPressed: () => _showCreateEventDialog(context),
              label: const Text('Schedule Event'),
              icon: const Icon(Icons.event_available),
              backgroundColor: Colors.blue.shade700,
            );
          case 3:
            return FloatingActionButton.extended(
              onPressed: () => _showAddResourceDialog(context),
              label: const Text('Add Resource'),
              icon: const Icon(Icons.add_box_outlined),
              backgroundColor: Colors.teal.shade700,
            );
          default:
            return const SizedBox.shrink();
        }
      },
    );
  }

  void _showCreateEventDialog(BuildContext context) {
    final titleCtrl = TextEditingController();
    final locationCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    DateTime selectedDate = DateTime.now().add(const Duration(days: 1));
    String activityType = 'meeting';
    int expectedParticipants = 20;

    final coopState = context.read<CooperativeBloc>().state;
    final coopId = coopState.cooperative?.id ?? '';

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Schedule Event'),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Event Title *',
                    prefixIcon: Icon(Icons.title),
                  ),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: activityType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: const [
                    DropdownMenuItem(value: 'meeting', child: Text('Meeting')),
                    DropdownMenuItem(value: 'training', child: Text('Training')),
                    DropdownMenuItem(value: 'harvest', child: Text('Harvest')),
                    DropdownMenuItem(value: 'planting', child: Text('Planting')),
                    DropdownMenuItem(value: 'other', child: Text('Other')),
                  ],
                  onChanged: (v) => setDialogState(() => activityType = v!),
                ),
                const SizedBox(height: 12),
                ListTile(
                  leading: const Icon(Icons.calendar_today),
                  title: Text(
                    '${selectedDate.day}/${selectedDate.month}/${selectedDate.year} ${selectedDate.hour.toString().padLeft(2, '0')}:${selectedDate.minute.toString().padLeft(2, '0')}',
                  ),
                  subtitle: const Text('Tap to change date & time'),
                  onTap: () async {
                    final date = await showDatePicker(
                      context: ctx,
                      initialDate: selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (date != null) {
                      final time = await showTimePicker(
                        context: ctx,
                        initialTime: TimeOfDay.fromDateTime(selectedDate),
                      );
                      if (time != null) {
                        setDialogState(() {
                          selectedDate = DateTime(date.year, date.month, date.day, time.hour, time.minute);
                        });
                      }
                    }
                  },
                ),
                const SizedBox(height: 8),
                TextField(
                  controller: locationCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Location',
                    prefixIcon: Icon(Icons.location_on),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  maxLines: 2,
                  decoration: const InputDecoration(
                    labelText: 'Description',
                    prefixIcon: Icon(Icons.notes),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.blue.shade700),
              onPressed: () {
                if (titleCtrl.text.trim().isEmpty) return;
                context.read<CooperativeBloc>().add(CreateCooperativeActivity(
                  cooperativeId: coopId,
                  title: titleCtrl.text.trim(),
                  activityType: activityType,
                  scheduledAt: selectedDate,
                  location: locationCtrl.text.trim().isEmpty ? null : locationCtrl.text.trim(),
                  description: descCtrl.text.trim().isEmpty ? null : descCtrl.text.trim(),
                  expectedParticipants: expectedParticipants,
                ));
                Navigator.pop(dialogContext);
              },
              child: const Text('Schedule', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddResourceDialog(BuildContext context) {
    final nameCtrl = TextEditingController();
    final categoryCtrl = TextEditingController();
    final locationCtrl = TextEditingController();
    final quantityCtrl = TextEditingController(text: '0');
    String resourceType = 'inputs';
    String unit = 'kg';
    String condition = 'Good';

    final coopState = context.read<CooperativeBloc>().state;
    final coopId = coopState.cooperative?.id ?? '';

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Add Resource'),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                DropdownButtonFormField<String>(
                  value: resourceType,
                  decoration: const InputDecoration(labelText: 'Type'),
                  items: const [
                    DropdownMenuItem(value: 'inputs', child: Text('Consumable Input (Seeds, Fertilizer)')),
                    DropdownMenuItem(value: 'equipment', child: Text('Equipment / Asset')),
                  ],
                  onChanged: (v) => setDialogState(() => resourceType = v!),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: nameCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Resource Name *',
                    prefixIcon: Icon(Icons.inventory),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: categoryCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Category (e.g. Fertilizer)',
                    prefixIcon: Icon(Icons.category),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: locationCtrl,
                  decoration: const InputDecoration(
                    labelText: 'Storage Location',
                    prefixIcon: Icon(Icons.location_on),
                  ),
                ),
                const SizedBox(height: 12),
                if (resourceType == 'inputs') ...[
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: quantityCtrl,
                          keyboardType: const TextInputType.numberWithOptions(decimal: true),
                          decoration: const InputDecoration(labelText: 'Quantity'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: unit,
                          decoration: const InputDecoration(labelText: 'Unit'),
                          items: const [
                            DropdownMenuItem(value: 'kg', child: Text('kg')),
                            DropdownMenuItem(value: 'bags', child: Text('Bags')),
                            DropdownMenuItem(value: 'liters', child: Text('Liters')),
                            DropdownMenuItem(value: 'units', child: Text('Units')),
                          ],
                          onChanged: (v) => setDialogState(() => unit = v!),
                        ),
                      ),
                    ],
                  ),
                ] else ...[
                  DropdownButtonFormField<String>(
                    value: condition,
                    decoration: const InputDecoration(labelText: 'Condition'),
                    items: const [
                      DropdownMenuItem(value: 'Excellent', child: Text('Excellent')),
                      DropdownMenuItem(value: 'Good', child: Text('Good')),
                      DropdownMenuItem(value: 'Fair', child: Text('Fair')),
                    ],
                    onChanged: (v) => setDialogState(() => condition = v!),
                  ),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: Colors.teal.shade700),
              onPressed: () {
                if (nameCtrl.text.trim().isEmpty) return;
                context.read<CooperativeBloc>().add(AddCooperativeResource(
                  cooperativeId: coopId,
                  name: nameCtrl.text.trim(),
                  resourceType: resourceType,
                  category: categoryCtrl.text.trim().isEmpty ? null : categoryCtrl.text.trim(),
                  location: locationCtrl.text.trim().isEmpty ? null : locationCtrl.text.trim(),
                  quantity: resourceType == 'inputs'
                      ? double.tryParse(quantityCtrl.text) ?? 0
                      : 1,
                  unit: resourceType == 'inputs' ? unit : 'unit',
                  condition: resourceType == 'equipment' ? condition : null,
                ));
                Navigator.pop(dialogContext);
              },
              child: const Text('Add', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  void _showAddMemberDialog(BuildContext context) {
    final phoneController = TextEditingController();
    final nameController = TextEditingController();

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Add Cooperative Member'),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: nameController,
              decoration: const InputDecoration(
                labelText: 'Full Name',
                prefixIcon: Icon(Icons.person),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: Icon(Icons.phone),
                hintText: '+250...',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green.shade700),
            onPressed: () {
              final coopState = context.read<CooperativeBloc>().state;
              if (coopState.cooperative != null &&
                  nameController.text.isNotEmpty &&
                  phoneController.text.isNotEmpty) {
                context.read<CooperativeBloc>().add(AddCooperativeMember(
                      cooperativeId: coopState.cooperative!.id,
                      phone: phoneController.text.trim(),
                      fullName: nameController.text.trim(),
                    ));
              }
              Navigator.pop(dialogContext);
            },
            child: const Text('Add', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}

// ─── FARMER VIEW ──────────────────────────────────────────────────────────────

class _FarmerCooperativesView extends StatelessWidget {
  const _FarmerCooperativesView();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AgukaAppBar(title: 'Cooperatives'),
      body: BlocBuilder<CooperativeBloc, CooperativeState>(
        builder: (context, state) {
          // Farmer already has a cooperative
          if (state.cooperative != null &&
              state.status == CooperativeStatus.loaded) {
            return _FarmerCoopView(coop: state.cooperative!,
                members: state.members);
          }

          // Loading
          if (state.status == CooperativeStatus.loading ||
              state.status == CooperativeStatus.initial) {
            return const Center(child: CircularProgressIndicator());
          }

          // No cooperative — show browse list
          return _BrowseCoopView(
            cooperatives: state.cooperativeList,
            requestStatus: state.membershipRequestStatus,
          );
        },
      ),
    );
  }
}

class _FarmerCoopView extends StatelessWidget {
  final CooperativeEntity coop;
  final List<CooperativeMemberEntity> members;
  const _FarmerCoopView({required this.coop, required this.members});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          elevation: 4,
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28,
                      backgroundColor: Colors.green.shade100,
                      child: Icon(Icons.groups,
                          color: Colors.green.shade800, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(coop.name,
                              style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold)),
                          Text('Reg: ${coop.registrationNumber}',
                              style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 12)),
                          if (coop.district != null)
                            Text('${coop.district}, ${coop.sector ?? ''}',
                                style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 12)),
                        ],
                      ),
                    ),
                  ],
                ),
                if (coop.description != null) ...[
                  const SizedBox(height: 12),
                  Text(coop.description!,
                      style: TextStyle(
                          color: Colors.grey.shade700, fontSize: 13)),
                ],
                const SizedBox(height: 16),
                Row(
                  children: [
                    _InfoChip(
                        icon: Icons.people,
                        label: '${coop.memberCount} Members'),
                    const SizedBox(width: 8),
                    _InfoChip(
                        icon: Icons.verified_user, label: 'Active'),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),
        const Text('Fellow Members',
            style:
                TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...members.take(10).map((m) => Card(
              margin: const EdgeInsets.only(bottom: 8),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
              child: ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.green.shade50,
                  child: Text(
                    m.fullName.isNotEmpty
                        ? m.fullName[0].toUpperCase()
                        : '?',
                    style: TextStyle(color: Colors.green.shade800),
                  ),
                ),
                title: Text(m.fullName),
                subtitle: Text(m.phone,
                    style: const TextStyle(fontSize: 12)),
                trailing: Chip(
                  label: Text(m.role,
                      style: const TextStyle(fontSize: 10)),
                  backgroundColor: Colors.green.shade50,
                ),
              ),
            )),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.green.shade50,
        borderRadius: BorderRadius.circular(99),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.green.shade700),
          const SizedBox(width: 4),
          Text(label,
              style: TextStyle(
                  fontSize: 12,
                  color: Colors.green.shade800,
                  fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _BrowseCoopView extends StatelessWidget {
  final List<CooperativeListItemEntity> cooperatives;
  final MembershipRequestStatus requestStatus;
  const _BrowseCoopView(
      {required this.cooperatives, required this.requestStatus});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (requestStatus == MembershipRequestStatus.sent)
          Container(
            width: double.infinity,
            padding:
                const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.green.shade50,
            child: Row(
              children: [
                Icon(Icons.check_circle,
                    color: Colors.green.shade700, size: 18),
                const SizedBox(width: 8),
                const Text('Membership request sent! Awaiting approval.',
                    style:
                        TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
              ],
            ),
          ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Find a Cooperative',
                  style: TextStyle(
                      fontSize: 18, fontWeight: FontWeight.bold)),
              Text('Join a cooperative to access shared resources and support.',
                  style: TextStyle(
                      fontSize: 13, color: Colors.grey.shade600)),
            ],
          ),
        ),
        if (cooperatives.isEmpty)
          const Expanded(
            child: Center(
              child: Text('No cooperatives available in your area.',
                  style: TextStyle(color: Colors.grey)),
            ),
          )
        else
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
              itemCount: cooperatives.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, i) => _CoopListCard(
                coop: cooperatives[i],
                isSending:
                    requestStatus == MembershipRequestStatus.sending,
              ),
            ),
          ),
      ],
    );
  }
}

class _CoopListCard extends StatelessWidget {
  final CooperativeListItemEntity coop;
  final bool isSending;
  const _CoopListCard({required this.coop, required this.isSending});

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.green.shade100,
                  child: Icon(Icons.groups, color: Colors.green.shade800),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(coop.name,
                          style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15)),
                      Text('${coop.district} · ${coop.sector}',
                          style: TextStyle(
                              fontSize: 12, color: Colors.grey.shade600)),
                    ],
                  ),
                ),
                Text('${coop.memberCount} members',
                    style: TextStyle(
                        fontSize: 11, color: Colors.grey.shade500)),
              ],
            ),
            if (coop.description != null) ...[
              const SizedBox(height: 8),
              Text(coop.description!,
                  style: TextStyle(
                      fontSize: 12, color: Colors.grey.shade700),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: isSending
                    ? null
                    : () => context
                        .read<CooperativeBloc>()
                        .add(RequestMembership(coop.id)),
                icon: isSending
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Icon(Icons.how_to_reg, size: 16),
                label: Text(isSending ? 'Sending...' : 'Request to Join'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── SHARED HELPERS ───────────────────────────────────────────────────────────

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String message;
  final String subtitle;
  const _EmptyState(
      {required this.icon, required this.message, required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 56, color: Colors.grey.shade300),
            const SizedBox(height: 16),
            Text(message,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center),
            const SizedBox(height: 8),
            Text(subtitle,
                style: TextStyle(color: Colors.grey.shade500, fontSize: 13),
                textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const _ErrorView({required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(message, textAlign: TextAlign.center),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
