Add-Type -AssemblyName System.Drawing

function Generate-Icon {
    param(
        [int]$size,
        [string]$outputPath
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Ultra-crisp rendering settings
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # 1. 100% Binary Monochrome White Canvas
    $g.Clear([System.Drawing.Color]::White)

    $scale = [double]$size / 512.0
    $blackPen1 = New-Object System.Drawing.Pen ([System.Drawing.Color]::Black), [float][Math]::Max(1.0, 1.5 * $scale)
    $blackPen2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::Black), [float][Math]::Max(1.5, 2.5 * $scale)
    $bracketPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::Black), [float][Math]::Max(2.0, 3.5 * $scale)
    $dimPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(60, 0, 0, 0)), [float][Math]::Max(1.0, 1.0 * $scale)
    $dimPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    $blackBrush = [System.Drawing.Brushes]::Black
    $whiteBrush = [System.Drawing.Brushes]::White

    # 2. 4 HUD Corner Brackets
    $bPad = [float](28.0 * $scale)
    $bLen = [float](40.0 * $scale)
    # Top-Left
    $pTL = @(
        (New-Object System.Drawing.PointF ($bPad, $bPad + $bLen)),
        (New-Object System.Drawing.PointF ($bPad, $bPad)),
        (New-Object System.Drawing.PointF ($bPad + $bLen, $bPad))
    )
    $g.DrawLines($bracketPen, $pTL)
    # Top-Right
    $pTR = @(
        (New-Object System.Drawing.PointF ($size - $bPad - $bLen, $bPad)),
        (New-Object System.Drawing.PointF ($size - $bPad, $bPad)),
        (New-Object System.Drawing.PointF ($size - $bPad, $bPad + $bLen))
    )
    $g.DrawLines($bracketPen, $pTR)
    # Bottom-Left
    $pBL = @(
        (New-Object System.Drawing.PointF ($bPad, $size - $bPad - $bLen)),
        (New-Object System.Drawing.PointF ($bPad, $size - $bPad)),
        (New-Object System.Drawing.PointF ($bPad + $bLen, $size - $bPad))
    )
    $g.DrawLines($bracketPen, $pBL)
    # Bottom-Right
    $pBR = @(
        (New-Object System.Drawing.PointF ($size - $bPad - $bLen, $size - $bPad)),
        (New-Object System.Drawing.PointF ($size - $bPad, $size - $bPad)),
        (New-Object System.Drawing.PointF ($size - $bPad, $size - $bPad - $bLen))
    )
    $g.DrawLines($bracketPen, $pBR)

    # 3. Concentric Orbital Rings
    $cx = [float]($size / 2.0)
    $cy = [float]($size / 2.0)

    $rOuter = [float](212.0 * $scale)
    $g.DrawEllipse($dimPen, [float]($cx - $rOuter), [float]($cy - $rOuter), [float]($rOuter * 2.0), [float]($rOuter * 2.0))

    $rMid = [float](168.0 * $scale)
    $g.DrawEllipse($blackPen1, [float]($cx - $rMid), [float]($cy - $rMid), [float]($rMid * 2.0), [float]($rMid * 2.0))

    $rInner = [float](116.0 * $scale)
    $g.DrawEllipse($blackPen1, [float]($cx - $rInner), [float]($cy - $rInner), [float]($rInner * 2.0), [float]($rInner * 2.0))

    # 4. Cardinal Crosshair Ticks
    $t1 = [float](36.0 * $scale)
    $t2 = [float](52.0 * $scale)
    $g.DrawLine($blackPen2, $cx, $t1, $cx, $t2)
    $g.DrawLine($blackPen2, $cx, [float]($size - $t2), $cx, [float]($size - $t1))
    $g.DrawLine($blackPen2, $t1, $cy, $t2, $cy)
    $g.DrawLine($blackPen2, [float]($size - $t2), $cy, [float]($size - $t1), $cy)

    # 5. Spines (24 Sea Urchin Needles)
    $rCore = [float](52.0 * $scale)
    $spineCount = 24
    for ($i = 0; $i -lt $spineCount; $i++) {
        $angle = ($i / $spineCount) * [Math]::PI * 2.0 - [Math]::PI / 2.0
        $isMajor = ($i % 4 -eq 0)

        $len = 0.0
        $pen = $null
        if ($isMajor) {
            $len = [float](140.0 * $scale)
            $pen = $blackPen2
        } else {
            $len = [float]((85.0 + [Math]::Sin($angle * 3.0) * 25.0) * $scale)
            $pen = $blackPen1
        }

        $x1 = [float]($cx + [Math]::Cos($angle) * $rCore)
        $y1 = [float]($cy + [Math]::Sin($angle) * $rCore)
        $x2 = [float]($cx + [Math]::Cos($angle) * ($rCore + $len))
        $y2 = [float]($cy + [Math]::Sin($angle) * ($rCore + $len))

        $g.DrawLine($pen, $x1, $y1, $x2, $y2)

        if ($isMajor) {
            $dotR = [float](3.5 * $scale)
            $g.FillEllipse($blackBrush, [float]($x2 - $dotR), [float]($y2 - $dotR), [float]($dotR * 2.0), [float]($dotR * 2.0))
        }
    }

    # 6. Central Singularity Core
    $g.FillEllipse($blackBrush, [float]($cx - $rCore), [float]($cy - $rCore), [float]($rCore * 2.0), [float]($rCore * 2.0))

    $rAperture = [float](16.0 * $scale)
    $g.FillEllipse($whiteBrush, [float]($cx - $rAperture), [float]($cy - $rAperture), [float]($rAperture * 2.0), [float]($rAperture * 2.0))

    $rDot = [float](5.0 * $scale)
    $g.FillEllipse($blackBrush, [float]($cx - $rDot), [float]($cy - $rDot), [float]($rDot * 2.0), [float]($rDot * 2.0))

    # Clean Up and Save
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $blackPen1.Dispose()
    $blackPen2.Dispose()
    $bracketPen.Dispose()
    $dimPen.Dispose()
    $g.Dispose()
    $bmp.Dispose()

    Write-Host "Generated: $outputPath ($size x $size)"
}

Generate-Icon -size 192 -outputPath "E:\Eng\web\public\icon-192.png"
Generate-Icon -size 512 -outputPath "E:\Eng\web\public\icon-512.png"
