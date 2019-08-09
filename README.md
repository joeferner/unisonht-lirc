
### Test LIRC

```
sudo systemctl start lircd
irw
sudo systemctl stop lircd
```

OR

```
sudo lircd --allow-simulate --immediate-init --driver=file --nodaemon

irsend simulate "A10C000F 00 NUM1 tivo"
```
