import 'package:flutter/material.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';

class LivestockCard extends StatelessWidget {
  final LivestockModel livestock;
  final VoidCallback onTap;

  const LivestockCard({Key? key, required this.livestock, required this.onTap}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.orange[50],
          child: const Icon(Icons.pets, color: Colors.orange),
        ),
        title: Text(livestock.animalType),
        subtitle: Text([
          if (livestock.breed != null) livestock.breed!,
          livestock.healthStatus,
        ].join(' • ')),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
