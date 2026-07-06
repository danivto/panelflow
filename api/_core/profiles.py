from dataclasses import dataclass, replace


@dataclass(frozen=True)
class DeviceProfile:
    id: str
    name: str
    width: int
    height: int
    grayscale: bool
    quality: int  # JPEG quality
    sharpen: bool  # mild unsharp mask, helps e-ink panels
    max_upscale: float = 2.0


PROFILES: dict[str, DeviceProfile] = {
    p.id: p
    for p in [
        DeviceProfile("kindle", "Kindle / Paperwhite", 1236, 1648, True, 85, True),
        DeviceProfile("kobo", "Kobo", 1264, 1680, True, 85, True),
        DeviceProfile("boox", "Boox", 1404, 1872, True, 85, True),
        DeviceProfile("pocketbook", "PocketBook", 758, 1024, True, 85, True),
        DeviceProfile("xteink-x4", "Xteink X4", 480, 800, True, 82, True),
        DeviceProfile("android", "Android phone", 1080, 2340, False, 88, False),
        DeviceProfile("iphone", "iPhone", 1179, 2556, False, 88, False),
        DeviceProfile("tablet", "Tablet", 1620, 2160, False, 88, False),
    ]
}


def resolve_profile(
    profile_id: str,
    custom_width: int | None = None,
    custom_height: int | None = None,
    custom_grayscale: bool | None = None,
    custom_quality: int | None = None,
) -> DeviceProfile:
    if profile_id == "custom":
        return DeviceProfile(
            id="custom",
            name="Custom",
            width=max(240, min(4096, custom_width or 1080)),
            height=max(240, min(4096, custom_height or 1620)),
            grayscale=bool(custom_grayscale),
            quality=max(50, min(100, custom_quality or 85)),
            sharpen=bool(custom_grayscale),
        )
    base = PROFILES.get(profile_id)
    if base is None:
        base = PROFILES["kindle"]
    if custom_quality:
        base = replace(base, quality=max(50, min(100, custom_quality)))
    return base
