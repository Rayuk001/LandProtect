var alldata = scload('serverdb.json');
if (alldata === undefined) {
    alldata = {};
    alldata.chunks = {};
}

function claimSign(event) {
    var player = event.getPlayer();
    var playerUUID = player.uniqueId;
    var specialCharacter = "^";
    var lines = event.getLines();
    var signText = lines[0] + lines[1] + lines[2] + lines[3];
    var chunk = event.getBlock().getWorld().getChunkAt(event.getBlock().getLocation());
    var x = chunk.getX();
    var z = chunk.getZ();

    var buyProperty = function(cx, cz, name, claimer) {
        alldata.chunks["x:" + cx + "z:" + cz] = {};
        alldata.chunks["x:" + cx + "z:" + cz].name = name;
        alldata.chunks["x:" + cx + "z:" + cz].owner = claimer.uniqueId.toString();
        scsave(alldata, 'serverdb.json');
        echo(claimer, "Congratulations, you are now the owner of ".green() + name + "!")
    }

    if (signText.length() > 0 && signText.substring(0, 1).equals(specialCharacter) && signText.substring(signText.length() - 1).equals(specialCharacter)) {
        var name = signText.substring(1, signText.length() - 1);
        if (name != "abandon") {
            if (alldata.chunks["x:" + x + "z:" + z] === undefined) {
                buyProperty(x, z, name, player)
            } else {
                if (alldata.chunks["x:" + x + "z:" + z].owner == player.uniqueId.toString()) {
                    alldata.chunks["x:" + x + "z:" + z].name = name;
                    scsave(alldata, 'serverdb.json');
                    echo(player, "You renamed this land to " + name)
                }
            }
        } else {
            if (alldata.chunks["x:" + x + "z:" + z] === undefined) {
                echo(player, "You can't name your claim 'abandon'. You do that when you want to abandon claimed land.".red())
            } else {
                alldata.chunks["x:" + x + "z:" + z] = undefined;
                scsave(alldata, 'serverdb.json');
                echo(player, "You abandoned this chunk.".yellow())
            }
        }
    }
}

var canBuild = function(location, player) {
    var x = location.getChunk().getX();
    var z = location.getChunk().getZ();
    if (player.isOp()) { //operators can edit the land if needed
        return true;
    } else {
        if (alldata.chunks["x:" + x + "z:" + z] === undefined) {
            return true;
        } else {
            if (location.getWorld().getEnvironment().equals(org.bukkit.World.Environment.NORMAL) && alldata.chunks["x:" + x + "z:" + z].owner == player.uniqueId.toString()) {
                return true;
            } else {
                return false;
            }
        }
    }
}

// Anti-griefing functions:
var onInteract = function(event) {
    var b = event.getClickedBlock();
    var p = event.getPlayer();
    if (b != null) {
        if (!canBuild(b.getLocation(), event.getPlayer())) {
            event.setCancelled(true);
            echo(p, "You don't have permission to do that".red());
        }
    }
}
var onBukkitFill = function(event) {
    var p = event.getPlayer();
    if (!canBuild(p.getLocation(), event.getPlayer())) {
        echo(p, "You don't have permission to do that".red());
        event.setCancelled(true);
    }
}
var onBukkitEmpty = function(event) {
    var p = event.getPlayer();
    if (!canBuild(event.getBlockClicked().getLocation(), event.getPlayer())) {
        echo(p, "You don't have permission to do that".red());
        event.setCancelled(true);
    }
}

var showPropertyName = function(event) {
    var player = event.getPlayer()
    if (!event.getFrom().getWorld().getName().endsWith("_nether") && !event.getFrom().getWorld().getName().endsWith("_end") && event.getFrom().getChunk() != event.getTo().getChunk()) {
        // announce new area
        var x1 = event.getFrom().getChunk().getX();
        var z1 = event.getFrom().getChunk().getZ();

        var x2 = event.getTo().getChunk().getX();
        var z2 = event.getTo().getChunk().getZ();

        var name1 = alldata.chunks["x:" + x1 + "z:" + z1] !== undefined ? alldata.chunks["x:" + x1 + "z:" + z1].name : "the wilderness";
        var name2 = alldata.chunks["x:" + x2 + "z:" + z2] !== undefined ? alldata.chunks["x:" + x2 + "z:" + z2].name : "the wilderness";

        if (name1 == null) name1 = "the wilderness";
        if (name2 == null) name2 = "the wilderness";

        if (!name1.equals(name2)) {
            if (name2.equals("the wilderness")) {
                echo(player, "".gray() + "[ " + name2 + " ]");
            } else {
                echo(player, "".yellow() + "[ " + name2 + " ]");
            }
        }
    }
}

events.signChange(claimSign);
events.playerBucketEmpty(onBukkitEmpty)
events.playerBucketFill(onBukkitFill)
events.playerInteract(onInteract)
events.playerMove(showPropertyName);
