#!/usr/bin/env python3
"""
Deployment Status Checker for GlassWall
This script checks the status of the GlassWall deployment on Vercel
"""

import os
import json
import requests
import datetime
import argparse
import logging
from typing import Dict, Any, Optional, List

# Constants
WORKSPACE = "/Users/karst/.openclaw/workspace"
LOGS_DIR = os.path.join(WORKSPACE, "logs")
MESSAGES_DIR = os.path.join(WORKSPACE, "autonomous_messages")
GLASSWALL_DIR = os.path.join(WORKSPACE, "glasswall-rebuild")
DEPLOYMENT_LOG = os.path.join(LOGS_DIR, "deployment_checker.log")

# Ensure directories exist
os.makedirs(LOGS_DIR, exist_ok=True)
os.makedirs(MESSAGES_DIR, exist_ok=True)

# Configure logging
logging.basicConfig(
    filename=DEPLOYMENT_LOG,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

class DeploymentChecker:
    """
    Checks the deployment status of GlassWall
    """
    def __init__(self):
        self.vercel_api_key = os.environ.get("VERCEL_API_KEY", "")
        self.project_id = "glasswall-app"  # Replace with your actual Vercel project ID
    
    def _log(self, message: str) -> None:
        """Log a message"""
        logging.info(message)
    
    def check_deployment_status(self) -> Dict[str, Any]:
        """
        Check the deployment status on Vercel
        Returns a dictionary with status information
        """
        if not self.vercel_api_key:
            self._log("Vercel API key not found in environment")
            return {
                "success": False,
                "error": "Vercel API key not found in environment",
                "timestamp": datetime.datetime.now().isoformat()
            }
        
        try:
            # API endpoint for deployments
            url = f"https://api.vercel.com/v6/deployments?projectId={self.project_id}&limit=5"
            
            # Headers with authentication
            headers = {
                "Authorization": f"Bearer {self.vercel_api_key}"
            }
            
            # Make the request
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                self._log(f"Failed to fetch deployments: {response.status_code}")
                return {
                    "success": False,
                    "error": f"Failed to fetch deployments: {response.status_code}",
                    "timestamp": datetime.datetime.now().isoformat()
                }
            
            # Parse the response
            deployments = response.json().get("deployments", [])
            
            if not deployments:
                self._log("No deployments found")
                return {
                    "success": True,
                    "deployments": [],
                    "timestamp": datetime.datetime.now().isoformat()
                }
            
            # Process deployments
            latest_deployment = deployments[0]
            
            # Extract useful information
            status = latest_deployment.get("state", "unknown")
            created_at = latest_deployment.get("createdAt")
            url = latest_deployment.get("url", "")
            branch = latest_deployment.get("meta", {}).get("branch", "unknown")
            commit = latest_deployment.get("meta", {}).get("githubCommitSha", "")[:7]
            
            # Format created_at
            if created_at:
                created_at = datetime.datetime.fromisoformat(created_at.replace("Z", "+00:00")).strftime("%Y-%m-%d %H:%M:%S UTC")
            
            return {
                "success": True,
                "latest": {
                    "status": status,
                    "created_at": created_at,
                    "url": url,
                    "branch": branch,
                    "commit": commit
                },
                "all_deployments": deployments,
                "timestamp": datetime.datetime.now().isoformat()
            }
        except Exception as e:
            self._log(f"Error checking deployment status: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.datetime.now().isoformat()
            }
    
    def check_local_status(self) -> Dict[str, Any]:
        """
        Check the local status of the GlassWall project
        Returns a dictionary with local status information
        """
        try:
            # Check if the GlassWall directory exists
            if not os.path.exists(GLASSWALL_DIR):
                self._log(f"GlassWall directory not found: {GLASSWALL_DIR}")
                return {
                    "success": False,
                    "error": f"GlassWall directory not found: {GLASSWALL_DIR}",
                    "timestamp": datetime.datetime.now().isoformat()
                }
            
            # Get the current branch
            os.chdir(GLASSWALL_DIR)
            result = os.popen("git rev-parse --abbrev-ref HEAD").read().strip()
            branch = result if result else "unknown"
            
            # Get the latest commit
            result = os.popen("git rev-parse --short HEAD").read().strip()
            commit = result if result else "unknown"
            
            # Check for uncommitted changes
            result = os.popen("git status --porcelain").read().strip()
            has_changes = bool(result)
            
            # Get the latest commit message
            result = os.popen("git log -1 --pretty=%B").read().strip()
            commit_message = result if result else "unknown"
            
            # Get the commit timestamp
            result = os.popen("git log -1 --pretty=%ci").read().strip()
            commit_time = result if result else "unknown"
            
            return {
                "success": True,
                "branch": branch,
                "commit": commit,
                "has_changes": has_changes,
                "commit_message": commit_message,
                "commit_time": commit_time,
                "timestamp": datetime.datetime.now().isoformat()
            }
        except Exception as e:
            self._log(f"Error checking local status: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.datetime.now().isoformat()
            }
    
    def compare_status(self) -> Dict[str, Any]:
        """
        Compare local and deployed status
        Returns a dictionary with comparison information
        """
        # Check deployment status
        deployment_status = self.check_deployment_status()
        
        # Check local status
        local_status = self.check_local_status()
        
        # If either check failed, return early
        if not deployment_status["success"] or not local_status["success"]:
            return {
                "success": False,
                "deployment_status": deployment_status,
                "local_status": local_status,
                "timestamp": datetime.datetime.now().isoformat()
            }
        
        # Compare the latest deployment with the local state
        latest = deployment_status.get("latest", {})
        deployed_commit = latest.get("commit", "")
        local_commit = local_status.get("commit", "")
        
        # Determine if local is ahead, behind, or in sync
        if deployed_commit == local_commit:
            sync_status = "in_sync"
            message = "Local and deployed versions are in sync"
        else:
            # This is a simplification - in a real environment, you would do a proper git comparison
            sync_status = "different"
            message = "Local and deployed versions are different"
        
        return {
            "success": True,
            "sync_status": sync_status,
            "message": message,
            "deployment_status": deployment_status,
            "local_status": local_status,
            "timestamp": datetime.datetime.now().isoformat()
        }
    
    def create_notification(self, comparison: Dict[str, Any]) -> Optional[str]:
        """
        Create a notification message based on the comparison result
        Returns a notification message or None if no notification is needed
        """
        if not comparison["success"]:
            return f"⚠️ Error comparing deployment status: {comparison.get('error', 'Unknown error')}"
        
        sync_status = comparison.get("sync_status", "")
        
        if sync_status == "in_sync":
            # No need for notification if everything is in sync
            return None
        
        # Get information for the notification
        deployment = comparison.get("deployment_status", {}).get("latest", {})
        local = comparison.get("local_status", {})
        
        # Create the notification
        now = datetime.datetime.now()
        timestamp = now.strftime("%Y-%m-%d %H:%M:%S")
        
        message = f"🚀 GlassWall Deployment Status Update ({timestamp})\n\n"
        
        # Add deployment information
        message += "Deployed Version:\n"
        message += f"• Status: {deployment.get('status', 'unknown')}\n"
        message += f"• Deployed: {deployment.get('created_at', 'unknown')}\n"
        message += f"• Branch: {deployment.get('branch', 'unknown')}\n"
        message += f"• Commit: {deployment.get('commit', 'unknown')}\n"
        message += f"• URL: {deployment.get('url', 'unknown')}\n\n"
        
        # Add local information
        message += "Local Version:\n"
        message += f"• Branch: {local.get('branch', 'unknown')}\n"
        message += f"• Commit: {local.get('commit', 'unknown')}\n"
        message += f"• Has Changes: {'Yes' if local.get('has_changes', False) else 'No'}\n"
        message += f"• Last Commit: {local.get('commit_time', 'unknown')}\n"
        message += f"• Message: {local.get('commit_message', 'unknown')}\n\n"
        
        # Add comparison information
        message += f"Status: {comparison.get('message', '')}"
        
        return message
    
    def send_notification(self, message: str) -> None:
        """Send a notification to the autonomous system"""
        try:
            # Create a unique message file
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            message_file = os.path.join(MESSAGES_DIR, f"message_{timestamp}.txt")
            
            with open(message_file, "w") as f:
                f.write(message)
            
            self._log(f"Notification sent: {message_file}")
        except Exception as e:
            self._log(f"Failed to send notification: {str(e)}")
    
    def run(self) -> str:
        """
        Run the deployment checker
        Returns a summary message
        """
        self._log("Starting deployment status check")
        
        # Compare local and deployed status
        comparison = self.compare_status()
        
        # Create notification if needed
        notification = self.create_notification(comparison)
        
        # Send notification if needed
        if notification:
            self.send_notification(notification)
        
        # Create a summary message
        summary = ""
        if comparison["success"]:
            deployment = comparison.get("deployment_status", {}).get("latest", {})
            local = comparison.get("local_status", {})
            
            summary = "GlassWall Deployment Status:\n"
            summary += f"• Deployed: {deployment.get('status', 'unknown')} on {deployment.get('branch', 'unknown')} ({deployment.get('commit', 'unknown')})\n"
            summary += f"• Local: {local.get('branch', 'unknown')} ({local.get('commit', 'unknown')})\n"
            summary += f"• Status: {comparison.get('message', '')}\n"
        else:
            summary = f"Error checking deployment status: {comparison.get('error', 'Unknown error')}"
        
        self._log("Deployment status check completed")
        return summary

def main() -> None:
    """Main function"""
    parser = argparse.ArgumentParser(description="Check GlassWall deployment status")
    parser.add_argument("--verbose", action="store_true", help="Print verbose output")
    
    args = parser.parse_args()
    
    checker = DeploymentChecker()
    summary = checker.run()
    
    # Always print the summary
    print(summary)

if __name__ == "__main__":
    main()