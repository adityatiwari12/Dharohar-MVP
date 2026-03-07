#!/bin/bash
# Allocates a 2GB swap file for EC2 instances with 1GB RAM to prevent OOM errors

echo "Creating 2GB swap file..."
# 1. Create a 2GB file
sudo fallocate -l 2G /swapfile

# 2. Secure the swap file so only root can read/write
sudo chmod 600 /swapfile

# 3. Mark the file as swap space
sudo mkswap /swapfile

# 4. Enable the swap
sudo swapon /swapfile

# 5. Make it permanent across reboots
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# 6. Adjust swappiness (optional, makes Linux prefer physical RAM over swap)
sudo sysctl vm.swappiness=10
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf

echo "Swap file created successfully! Current memory status:"
free -h
