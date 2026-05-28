import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';

class CropCard extends StatelessWidget {
  final CropModel crop;
  final VoidCallback onTap;

  const CropCard({Key? key, required this.crop, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green[50],
          child: const Icon(Icons.eco, color: Colors.green),
        ),
        title: Text(crop.name),
        subtitle: Text([
          if (crop.status != null) crop.status!,
          if (crop.plantedDate != null)
            DateFormat('MMM d, y').format(crop.plantedDate!),
        ].join(' • ')),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
