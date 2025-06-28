import { useEffect, useRef, useState } from 'react';
import { InputManager } from '@/lib/game/InputManager';

export function VirtualControls() {
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const jumpButtonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [knobPosition, setKnobPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const joystick = joystickRef.current;
    const knob = knobRef.current;
    const jumpButton = jumpButtonRef.current;
    
    if (!joystick || !knob || !jumpButton) return;

    const joystickRect = joystick.getBoundingClientRect();
    const joystickCenter = {
      x: joystickRect.width / 2,
      y: joystickRect.height / 2
    };

    const handleStart = (clientX: number, clientY: number) => {
      setIsDragging(true);
      const rect = joystick.getBoundingClientRect();
      const x = clientX - rect.left - joystickCenter.x;
      const y = clientY - rect.top - joystickCenter.y;
      
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 40;
      
      if (distance <= maxDistance) {
        setKnobPosition({ x, y });
        
        // Update input manager
        const normalizedX = x / maxDistance;
        const normalizedY = y / maxDistance;
        
        if (Math.abs(normalizedX) > 0.3) {
          if (normalizedX > 0) {
            InputManager.setKey('ArrowRight', true);
            InputManager.setKey('ArrowLeft', false);
          } else {
            InputManager.setKey('ArrowLeft', true);
            InputManager.setKey('ArrowRight', false);
          }
        } else {
          InputManager.setKey('ArrowLeft', false);
          InputManager.setKey('ArrowRight', false);
        }
      }
    };

    const handleMove = (clientX: number, clientY: number) => {
      if (!isDragging) return;
      
      const rect = joystick.getBoundingClientRect();
      const x = clientX - rect.left - joystickCenter.x;
      const y = clientY - rect.top - joystickCenter.y;
      
      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 40;
      
      if (distance <= maxDistance) {
        setKnobPosition({ x, y });
      } else {
        const angle = Math.atan2(y, x);
        const limitedX = Math.cos(angle) * maxDistance;
        const limitedY = Math.sin(angle) * maxDistance;
        setKnobPosition({ x: limitedX, y: limitedY });
      }
      
      // Update input manager
      const normalizedX = Math.max(-1, Math.min(1, x / maxDistance));
      
      if (Math.abs(normalizedX) > 0.3) {
        if (normalizedX > 0) {
          InputManager.setKey('ArrowRight', true);
          InputManager.setKey('ArrowLeft', false);
        } else {
          InputManager.setKey('ArrowLeft', true);
          InputManager.setKey('ArrowRight', false);
        }
      } else {
        InputManager.setKey('ArrowLeft', false);
        InputManager.setKey('ArrowRight', false);
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setKnobPosition({ x: 0, y: 0 });
      InputManager.setKey('ArrowLeft', false);
      InputManager.setKey('ArrowRight', false);
    };

    // Touch events for joystick
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleStart(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // Mouse events for joystick (for testing on desktop)
    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleStart(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      handleEnd();
    };

    // Jump button events
    const handleJumpStart = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      InputManager.setKey('Space', true);
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    };

    const handleJumpEnd = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      InputManager.setKey('Space', false);
    };

    // Add event listeners
    joystick.addEventListener('touchstart', handleTouchStart);
    joystick.addEventListener('mousedown', handleMouseDown);
    
    jumpButton.addEventListener('touchstart', handleJumpStart);
    jumpButton.addEventListener('touchend', handleJumpEnd);
    jumpButton.addEventListener('mousedown', handleJumpStart);
    jumpButton.addEventListener('mouseup', handleJumpEnd);

    // Global event listeners for drag operations
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleGlobalTouchEnd = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleEnd();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (isDragging) {
        e.preventDefault();
        handleEnd();
      }
    };

    document.addEventListener('touchmove', handleGlobalTouchMove);
    document.addEventListener('touchend', handleGlobalTouchEnd);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      joystick.removeEventListener('touchstart', handleTouchStart);
      joystick.removeEventListener('mousedown', handleMouseDown);
      
      jumpButton.removeEventListener('touchstart', handleJumpStart);
      jumpButton.removeEventListener('touchend', handleJumpEnd);
      jumpButton.removeEventListener('mousedown', handleJumpStart);
      jumpButton.removeEventListener('mouseup', handleJumpEnd);

      document.removeEventListener('touchmove', handleGlobalTouchMove);
      document.removeEventListener('touchend', handleGlobalTouchEnd);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 15,
      height: '200px',
      pointerEvents: 'none'
    }}>
      {/* Virtual Joystick */}
      <div
        ref={joystickRef}
        style={{
          position: 'absolute',
          bottom: '30px',
          left: '30px',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '3px solid rgba(255, 255, 255, 0.5)',
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      >
        <div
          ref={knobRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '2px solid #000',
            transform: `translate(calc(-50% + ${knobPosition.x}px), calc(-50% + ${knobPosition.y}px))`,
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        />
      </div>

      {/* Jump Button */}
      <button
        ref={jumpButtonRef}
        style={{
          position: 'absolute',
          bottom: '50px',
          right: '30px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#FF6B35',
          border: '4px solid #000',
          color: 'white',
          fontSize: '16px',
          fontFamily: '"Courier New", monospace',
          fontWeight: 'bold',
          textShadow: '1px 1px 0px #000',
          pointerEvents: 'auto',
          touchAction: 'none',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        JUMP
      </button>
    </div>
  );
}
