#!/usr/bin/env node
/**
 * Health Check Script for MoltHQ
 * 
 * Checks the health of all sites in the directory and updates their status.
 * Run this periodically (via cron) to keep health data fresh.
 */

import fs from 'fs';
import path from 'path';

interface HealthStatus {
  status: 'healthy' | 'slow' | 'down' | 'unknown';
  last_checked: string;
  last_verified: string | null;
  response_time_ms: number | null;
  uptime_percent: number | null;
}

interface Site {
  id: string;
  name: string;
  url: string;
  has_api: boolean;
  api_docs?: string;
  health: HealthStatus;
  [key: string]: any;
}

interface SitesData {
  version: string;
  updated_at: string;
  sites: Site[];
  categories: any[];
}

async function checkSiteHealth(site: Site): Promise<HealthStatus> {
  const startTime = Date.now();
  
  try {
    // Try to fetch the main URL or API docs
    const urlToCheck = site.has_api && site.api_docs ? site.api_docs : site.url;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const response = await fetch(urlToCheck, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
    });
    
    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    
    // Determine status based on response
    let status: 'healthy' | 'slow' | 'down';
    if (response.ok) {
      status = responseTime < 2000 ? 'healthy' : 'slow';
    } else {
      status = 'down';
    }
    
    return {
      status,
      last_checked: new Date().toISOString(),
      last_verified: response.ok ? new Date().toISOString() : site.health.last_verified,
      response_time_ms: responseTime,
      uptime_percent: site.health.uptime_percent, // Calculate this over time
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error(`Failed to check ${site.name}:`, error);
    
    return {
      status: 'down',
      last_checked: new Date().toISOString(),
      last_verified: site.health.last_verified,
      response_time_ms: responseTime,
      uptime_percent: site.health.uptime_percent,
    };
  }
}

async function runHealthChecks() {
  console.log('🏥 Running health checks for MoltHQ...\n');
  
  const dataPath = path.join(process.cwd(), 'data', 'sites.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const sitesData: SitesData = JSON.parse(rawData);
  
  const results: { site: string; status: string; time: number | null }[] = [];
  
  // Check each site sequentially to avoid rate limiting
  for (const site of sitesData.sites) {
    console.log(`Checking ${site.name}...`);
    const health = await checkSiteHealth(site);
    site.health = health;
    
    const statusEmoji = {
      healthy: '✅',
      slow: '⚠️',
      down: '❌',
      unknown: '🔄',
    }[health.status];
    
    console.log(`  ${statusEmoji} ${health.status} (${health.response_time_ms}ms)\n`);
    
    results.push({
      site: site.name,
      status: health.status,
      time: health.response_time_ms,
    });
    
    // Small delay between checks to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Update the file
  sitesData.updated_at = new Date().toISOString();
  fs.writeFileSync(dataPath, JSON.stringify(sitesData, null, 2));
  
  console.log('📊 Health Check Summary:');
  console.log('========================\n');
  
  const summary = {
    healthy: results.filter(r => r.status === 'healthy').length,
    slow: results.filter(r => r.status === 'slow').length,
    down: results.filter(r => r.status === 'down').length,
  };
  
  console.log(`✅ Healthy: ${summary.healthy}`);
  console.log(`⚠️  Slow:    ${summary.slow}`);
  console.log(`❌ Down:    ${summary.down}`);
  console.log(`\n✨ Health data updated in ${dataPath}`);
}

// Run the health checks
runHealthChecks().catch(console.error);
