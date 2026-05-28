import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/activities/domain/entities/activity.dart';

class ActivityCard extends StatelessWidget {
  final Activity activity;

  const ActivityCard({Key? key, required this.activity}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green[50],
          child: const Icon(Icons.task_alt, color: Colors.green),
        ),
        title: Text(
          activity.activityType,
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (activity.notes != null && activity.notes!.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(activity.notes!),
              ),
            const SizedBox(height: 4),
            Text(DateFormat('MMM d, y').format(activity.activityDate)),
          ],
        ),
      ),
    );
  }
}
