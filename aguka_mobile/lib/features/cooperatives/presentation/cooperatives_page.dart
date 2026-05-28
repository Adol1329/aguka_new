import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';
import 'package:aguka_mobile/injection_container.dart';

class CooperativesPage extends StatelessWidget {
  const CooperativesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => sl<CooperativeBloc>()..add(FetchMyCooperative()),
      child: const CooperativesView(),
    );
  }
}

class CooperativesView extends StatelessWidget {
  const CooperativesView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const AgukaAppBar(title: 'Cooperative Hub'),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddMemberDialog(context),
        label: const Text('Add Farmer'),
        icon: const Icon(Icons.person_add),
        backgroundColor: Colors.green.shade700,
      ),
      body: BlocBuilder<CooperativeBloc, CooperativeState>(
        builder: (context, state) {
          if (state.status == CooperativeStatus.initial ||
              state.status == CooperativeStatus.loading) {
            return const Center(child: CircularProgressIndicator());
          } else if (state.status == CooperativeStatus.loaded &&
              state.cooperative != null) {
            return _buildCoopContent(
                context, state.cooperative!, state.members);
          } else if (state.status == CooperativeStatus.error) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: ${state.errorMessage}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context
                        .read<CooperativeBloc>()
                        .add(FetchMyCooperative()),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildCoopContent(BuildContext context, CooperativeEntity coop,
      List<CooperativeMemberEntity> members) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildCoopHeader(coop),
        const SizedBox(height: 24),
        const Text('Cooperative Members',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 12),
        ...members.map((member) => _buildMemberTile(member)),
        if (members.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32),
              child: Text('No members yet. Add your first farmer!',
                  style: TextStyle(color: Colors.grey)),
            ),
          ),
      ],
    );
  }

  Widget _buildCoopHeader(CooperativeEntity coop) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.green.shade100,
                  child: Icon(Icons.groups,
                      color: Colors.green.shade800, size: 30),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(coop.name,
                          style: const TextStyle(
                              fontSize: 20, fontWeight: FontWeight.bold)),
                      Text('Reg No: ${coop.registrationNumber}',
                          style:
                              TextStyle(color: Colors.grey.shade600)),
                      if (coop.description != null) ...[
                        const SizedBox(height: 4),
                        Text(coop.description!,
                            style: const TextStyle(fontSize: 12),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis),
                      ],
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            IntrinsicHeight(
              child: Row(
                children: [
                  _buildStatItem(
                      'Members', coop.memberCount.toString(), Icons.person),
                  const VerticalDivider(width: 32),
                  _buildStatItem('Status', 'Active', Icons.verified_user),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Expanded(
      child: Column(
        children: [
          Icon(icon, color: Colors.green, size: 20),
          const SizedBox(height: 4),
          Text(value,
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.bold)),
          Text(label,
              style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildMemberTile(CooperativeMemberEntity member) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: const CircleAvatar(child: Icon(Icons.person_outline)),
        title: Text(member.fullName),
        subtitle: Text(member.phone),
        trailing: Chip(
          label: Text(member.role, style: const TextStyle(fontSize: 10)),
          backgroundColor: Colors.green.shade50,
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
            child:
                const Text('Add', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
