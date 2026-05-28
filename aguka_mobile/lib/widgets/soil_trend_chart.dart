import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';

class SoilTrendChart extends StatelessWidget {
  final List<Map<String, dynamic>> readings;

  const SoilTrendChart({Key? key, required this.readings}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (readings.isEmpty) {
      return const Center(child: Text('No historical data available'));
    }

    // Prepare data for the chart
    // We'll show moisture trend as a line
    List<FlSpot> spots = [];
    for (int i = 0; i < readings.length; i++) {
      final double moisture = (readings[i]['moisture_percent'] ?? 0.0).toDouble();
      spots.add(FlSpot(i.toDouble(), moisture));
    }

    // Sort spots by X to ensure line moves left to right (reverse order from list which is DESC)
    spots = spots.reversed.toList();
    // Reset X indices to 0...N
    for (int i = 0; i < spots.length; i++) {
      spots[i] = FlSpot(i.toDouble(), spots[i].y);
    }

    return LineChart(
      LineChartData(
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: 20,
          getDrawingHorizontalLine: (value) => FlLine(
            color: Colors.grey[300],
            strokeWidth: 1,
          ),
        ),
        titlesData: FlTitlesData(
          show: true,
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 22,
              interval: (spots.length / 5).clamp(1.0, 100.0).toDouble(),
              getTitlesWidget: (value, meta) {
                final int index = (readings.length - 1 - value.toInt()).toInt();
                if (index < 0 || index >= readings.length) return const SizedBox();
                final date = DateTime.parse(readings[index]['reading_at']);
                return Text(
                  DateFormat('MM/dd').format(date),
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                );
              },
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              interval: 20,
              reservedSize: 30,
              getTitlesWidget: (value, meta) {
                return Text(
                  '${value.toInt()}%',
                  style: const TextStyle(fontSize: 10, color: Colors.grey),
                );
              },
            ),
          ),
        ),
        borderData: FlBorderData(show: false),
        minX: 0,
        maxX: (spots.length - 1).toDouble(),
        minY: 0,
        maxY: 100,
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            gradient: const LinearGradient(colors: [Colors.green, Colors.blue]),
            barWidth: 4,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  Colors.green.withAlpha((0.3 * 255).toInt()),
                  Colors.blue.withAlpha((0.1 * 255).toInt()),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
